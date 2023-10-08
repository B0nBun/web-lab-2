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
        updateCanvasHitcheckView(canvasFormElements, response);
    }
});

updateCanvasHitcheckView(canvasFormElements);

/**
 *
 * @param {{ canvas: HTMLCanvasElement; xInput: HTMLInputElement, yInput: HTMLInputElement; hitCheckbox: HTMLInputElement }} canvas
 * @param {{ x: number; y: number; r: number; hit: boolean}=} pointOptions
 */
function updateCanvasHitcheckView(
    { canvas, xInput, yInput, hitCheckbox },
    pointOptions,
) {
    drawCanvasHitcheck(canvas, pointOptions);
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
 * @param {{ x: number; y: number; r: number; hit: boolean }=} pointOptions
 */
function drawCanvasHitcheck(canvas, pointOptions) {
    const ctx = canvas.getContext("2d");
    if (ctx == null) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const translateX = width * OUTSIDE_WHITESPACE_RATIO;
    const translateY = height * OUTSIDE_WHITESPACE_RATIO;
    const scale = 1 - 2 * OUTSIDE_WHITESPACE_RATIO;
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#0f92be";

    // Top-left square
    ctx.fillRect(0, 0, width / 2, height / 2);

    // Top-right arc
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, width / 2, 0, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    // Bottom-right triangle
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(width / 2, (height * 3) / 4);
    ctx.lineTo((width * 3) / 4, height / 2);
    ctx.closePath();
    ctx.fill();

    // X and Y axis
    ctx.resetTransform();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.closePath();

    if (pointOptions) {
        const { x, y, r, hit } = pointOptions;
        ctx.translate(width / 2, height / 2);
        ctx.fillStyle = hit ? "green" : "red";
        const dotX = ((x / r) * width * (1 - 2 * OUTSIDE_WHITESPACE_RATIO)) / 2;
        const dotY =
            ((-y / r) * height * (1 - 2 * OUTSIDE_WHITESPACE_RATIO)) / 2;
        ctx.fillRect(dotX - 5, dotY - 5, 10, 10);
    }

    ctx.resetTransform();
}
