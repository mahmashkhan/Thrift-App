const phoneRegex = /(\+?\d[\s\-]?){10,}/g;
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;

export const containsBlockedContent = (text) => {
    return phoneRegex.test(text) || emailRegex.test(text);
};