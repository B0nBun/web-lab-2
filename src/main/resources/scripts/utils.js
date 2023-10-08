/**
 * @type {import("./selectElement.d.ts").selectElement}
 */
export function selectElement(selector, elementType) {
    const element = document.querySelector(selector);
    if (element && element instanceof elementType) {
        return element;
    }
    throw new Error(
        `Selected element had an unexpected type: expected ${elementType} from ${element}`,
    );
}

/**
 * @param {Element} element
 * @param {boolean | undefined} value
 */
export function setAriaInvalid(element, value) {
    if (value === undefined) {
        element.removeAttribute("aria-invalid");
    } else {
        element.setAttribute("aria-invalid", String(value));
    }
}

/**
 * @param {HTMLFieldSetElement} fieldset
 * @param {boolean | undefined} value
 */
export function setAriaInvalidOnFieldset(fieldset, value) {
    const inputs = fieldset.querySelectorAll("input");
    inputs.forEach((input) => setAriaInvalid(input, value));
}

/**
 * @param {FormData} formData
 * @returns {URLSearchParams}
 */
export function formDataToUrlSearchParams(formData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) continue;
        params.append(key, value);
    }
    return params;
}

/**
 * @returns {typeof fetch}
 */
export function createSwitchingFetch() {
    /** @type {AbortController | null} */
    let abortController = null;
    return (input, init) => {
        abortController?.abort();
        abortController = new AbortController();
        return fetch(input, { signal: abortController.signal, ...init });
    };
}

/**
 * @typedef ValidatorOptions
 * @type {object}
 * @property {(value: string | undefined) => string | undefined} validate
 * @property {(error: string | undefined) => void} displayError
 */

/**
 *
 * @param { HTMLFormElement } form
 * @param { Record<string, ValidatorOptions> } validators
 */
export function attachFormValidation(form, validators) {
    form.addEventListener(
        "change",
        (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            const name = target.getAttribute("name");
            if (!name || !validators[name]) return;
            const { validate, displayError } = validators[name];
            const value = new FormData(form).get(name);
            if (value instanceof File) return;
            const error = validate(value ?? undefined);
            displayError(error);
        },
        {
            capture: true,
        },
    );

    form.addEventListener("submit", (event) => {
        const formData = new FormData(form);
        for (const [name, { validate, displayError }] of Object.entries(
            validators,
        )) {
            const value = formData.get(name);
            if (value instanceof File) return;
            const error = validate(value ?? undefined);
            displayError(error);
            if (error) {
                event.preventDefault();
            }
        }
    });
}
