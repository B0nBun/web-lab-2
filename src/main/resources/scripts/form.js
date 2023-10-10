"use strict";

import {
    attachFormValidation,
    createSwitchingFetch,
    formDataToUrlSearchParams,
    selectElement,
    setAriaInvalid,
    setAriaInvalidOnFieldset,
} from "./utils.js";

const selectors = {
    form: "#form",
    xFieldset: "#x-fieldset",
    xError: "#x-error",
    yInput: "#y-input",
    yError: "#y-error",
    rFieldset: "#r-fieldset",
    rError: "#r-error",
    canvas: {
        canvas: "#hitcheck-canvas",
        rFieldset: "#canvas-r-fieldset",
        rError: "#canvas-r-error",
        xInput: "#canvas-x-input",
        yInput: "#canvas-y-input",
        hitCheckbox: "#canvas-hit-checkbox",
        canvasForm: "#canvas-form",
    },
};

const form = selectElement(selectors.form, HTMLFormElement);

const yInput = selectElement(selectors.yInput, HTMLInputElement);
const minY = Number(yInput.dataset.minY);
const maxY = Number(yInput.dataset.maxY);

attachFormValidation(form, {
    x: {
        validate: (value) => (!value ? "X is required" : undefined),
        displayError: (error) => {
            const fieldset = selectElement(
                selectors.xFieldset,
                HTMLFieldSetElement,
            );
            const errorElement = selectElement(selectors.xError, HTMLElement);
            setAriaInvalidOnFieldset(fieldset, Boolean(error) || undefined);
            errorElement.textContent = error ?? null;
        },
    },
    y: {
        validate: (value) => {
            const num = Number(value);
            if (!value || !isFinite(num))
                return "Y is required and must be a number";
            if (num < minY || maxY < num)
                return `Y must be between ${minY} and ${maxY}`;
        },
        displayError: (error) => {
            const input = selectElement(selectors.yInput, HTMLInputElement);
            const errorElement = selectElement(selectors.yError, HTMLElement);
            setAriaInvalid(input, Boolean(error) || undefined);
            errorElement.textContent = error ?? null;
        },
    },
    r: {
        validate: (value) => (!value ? "R is required" : undefined),
        displayError: (error) => {
            const fieldset = selectElement(
                selectors.rFieldset,
                HTMLFieldSetElement,
            );
            const errorElement = selectElement(selectors.rError, HTMLElement);
            setAriaInvalidOnFieldset(fieldset, Boolean(error) || undefined);
            errorElement.textContent = error ?? null;
        },
    },
});

const OUTSIDE_WHITESPACE_RATIO = 0.1;
const canvasRFieldset = selectElement(
    selectors.canvas.rFieldset,
    HTMLFieldSetElement,
);
const canvasRError = selectElement(selectors.canvas.rError, HTMLElement);
const canvasFormElements = {
    canvas: selectElement(selectors.canvas.canvas, HTMLCanvasElement),
    xInput: selectElement(selectors.canvas.xInput, HTMLInputElement),
    yInput: selectElement(selectors.canvas.yInput, HTMLInputElement),
    hitCheckbox: selectElement(selectors.canvas.hitCheckbox, HTMLInputElement),
};
const canvasForm = selectElement(selectors.canvas.canvasForm, HTMLFormElement);
const canvasFetch = createSwitchingFetch();

/** @constant */
const canvasStyling = {
    colors: {
        axis: "#0f92be",
        shapes: "#0f92be",
        hit: "#388e3c",
        miss: "#c62828",
    },
    lineWidths: {
        grid: 1,
        axis: 2,
        point: 1,
    },
    pointLineDashes: [5, 5],
    shapesAlpha: 0.6,
    gridAlpha: 0.1,
};

canvasFormElements.canvas.addEventListener("click", async (event) => {
    const canvasFormData = new FormData(canvasForm);
    const r = Number(canvasFormData.get("r"));
    if (!r) {
        setAriaInvalidOnFieldset(canvasRFieldset, true);
        canvasRError.textContent = "R is required";
        return;
    }
    setAriaInvalidOnFieldset(canvasRFieldset, undefined);
    canvasRError.textContent = "";
    const target = /** @type {HTMLCanvasElement} */ (event.currentTarget);
    const rect = target.getBoundingClientRect();

    const ratioX = (2 * (event.clientX - rect.left)) / rect.width - 1;
    const ratioY = -1 * ((2 * (event.clientY - rect.top)) / rect.height - 1);
    const ratioXRelativeToR = ratioX / (1 - 2 * OUTSIDE_WHITESPACE_RATIO);
    const ratioYRelativeToR = ratioY / (1 - 2 * OUTSIDE_WHITESPACE_RATIO);
    const x = ratioXRelativeToR * r;
    const y = ratioYRelativeToR * r;

    const formData = new FormData();
    formData.append("x", String(x));
    formData.append("y", String(y));
    formData.append("r", String(r));
    formData.append("response-type", "api");

    /**
     * @typedef {object} AreaCheckApiResponse
     * @property {number} x
     * @property {number} y
     * @property {number} r
     * @property {boolean} hit
     */

    const body = formDataToUrlSearchParams(formData);
    /** @type {AreaCheckApiResponse | null} */
    const response = await canvasFetch("/", { method: "POST", body })
        .then((response) => response.json())
        .catch((err) => {
            console.error(err);
            return null;
        });

    if (response) {
        updateCanvasHitcheckView(canvasFormElements, response.r, response);
    }
});

canvasRFieldset.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const rValue = Number(input.value);
    updateCanvasHitcheckView(canvasFormElements, rValue);
});

updateCanvasHitcheckView(canvasFormElements);

/**
 *
 * @param {{ canvas: HTMLCanvasElement; xInput: HTMLInputElement, yInput: HTMLInputElement; hitCheckbox: HTMLInputElement }} canvas
 * @param {number=} r
 * @param {{ x: number; y: number; hit: boolean}=} pointOptions
 */
function updateCanvasHitcheckView(
    { canvas, xInput, yInput, hitCheckbox },
    r,
    pointOptions,
) {
    drawCanvasHitcheck(canvas, r, pointOptions);
    if (!pointOptions) {
        hitCheckbox.indeterminate = true;
        return;
    }
    const { x, y, hit } = pointOptions;
    xInput.value = String(x);
    yInput.value = String(y);
    hitCheckbox.indeterminate = false;
    hitCheckbox.checked = hit;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number=} r
 * @param {{ x: number; y: number; hit: boolean }=} pointOptions
 */
function drawCanvasHitcheck(canvas, r, pointOptions) {
    const ctx = canvas.getContext("2d");
    if (ctx == null) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.globalAlpha = canvasStyling.gridAlpha;
    ctx.strokeStyle = canvasStyling.colors.axis;
    ctx.lineWidth = canvasStyling.lineWidths.grid;
    ctx.beginPath();
    const gridCells = 6;
    for (let i = 1; i < gridCells; i++) {
        ctx.moveTo(0, (width * i) / gridCells);
        ctx.lineTo(height, (width * i) / gridCells);
        ctx.moveTo((height * i) / gridCells, 0);
        ctx.lineTo((height * i) / gridCells, width);
    }
    ctx.stroke();
    ctx.closePath();

    const translateX = width * OUTSIDE_WHITESPACE_RATIO;
    const translateY = height * OUTSIDE_WHITESPACE_RATIO;
    const scale = 1 - 2 * OUTSIDE_WHITESPACE_RATIO;
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    ctx.globalAlpha = canvasStyling.shapesAlpha;
    ctx.fillStyle = canvasStyling.colors.shapes;

    // Top-left square
    ctx.fillRect(0, 0, width / 2, height / 2);

    // Top-right arc
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, width / 2, 0, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    // R value label
    ctx.globalAlpha = 1;
    const fontSize = (height / 15) * scale;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(r ? String(r) : "R", width, fontSize + height / 2);
    ctx.globalAlpha = canvasStyling.shapesAlpha;

    // Bottom-right triangle
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(width / 2, (height * 3) / 4);
    ctx.lineTo((width * 3) / 4, height / 2);
    ctx.closePath();
    ctx.fill();

    // X and Y axis
    ctx.resetTransform();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = canvasStyling.colors.axis;
    ctx.lineWidth = canvasStyling.lineWidths.axis;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.closePath();

    if (pointOptions && r) {
        const { x, y, hit } = pointOptions;
        const pointWidth = 10;
        ctx.fillStyle = hit
            ? canvasStyling.colors.hit
            : canvasStyling.colors.miss;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.setLineDash(canvasStyling.pointLineDashes);
        ctx.lineWidth = canvasStyling.lineWidths.point;
        const dotX =
            ((x / r) * width * (1 - 2 * OUTSIDE_WHITESPACE_RATIO)) / 2 +
            width / 2;
        const dotY =
            ((-y / r) * height * (1 - 2 * OUTSIDE_WHITESPACE_RATIO)) / 2 +
            height / 2;
        ctx.fillRect(
            dotX - pointWidth / 2,
            dotY - pointWidth / 2,
            pointWidth,
            pointWidth,
        );
        ctx.beginPath();
        ctx.moveTo(dotX, 0);
        ctx.lineTo(dotX, height);
        ctx.moveTo(0, dotY);
        ctx.lineTo(width, dotY);
        ctx.stroke();
        ctx.closePath();
    }

    ctx.setLineDash([]);
    ctx.resetTransform();
}
