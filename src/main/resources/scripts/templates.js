document.querySelectorAll("[data-use-template]").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const templateId = element.dataset.useTemplate;
    const template = document.querySelector(`template#${templateId}`);

    if (!template || !(template instanceof HTMLTemplateElement)) return;

    const content = template.content.cloneNode(true);
    element.replaceWith(...Array.from(content.childNodes));
});
