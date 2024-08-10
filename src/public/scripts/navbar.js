
const getTransitionEndedEventName = () => {
    const isChrome = navigator.userAgent.includes("Chrome");
    const isFirefox = navigator.userAgent.includes("Firefox");
    const isIe9 = navigator.userAgent.includes("MSIE 9.0");
    if (isChrome) {
        return "webkitTransitionEnd";
    } else if (isFirefox) {
        return "transitionend";
    } else if (isIe9) {
        return "msTransitionEnd";
    } else {
        return "oTransitionEnd";
    }
};

transitionEndedEvent = getTransitionEndedEventName();

let selected_index = 0;

const callbacks = [
    () => onTransitionEnded(0),
    () => onTransitionEnded(1),
    () => onTransitionEnded(2),
    () => onTransitionEnded(3),
];

const pages = [
    "/user/dashboard",
    "/user/income",
    "/user/expense",
    "/user/summary"
];

const onTransitionEnded = (index) => {
    page = pages[index];
    window.location.href = page;
};

document.onNavbarButtonClick = (index) => {
    selected_button = document.querySelector("div#navbar div.navbar-button.selected");
    buttons = document.querySelectorAll("div#navbar div.navbar-button");
    button = buttons[index];
    if (selected_index === index) {
        return;
    }
    selected_button.removeEventListener(transitionEndedEvent, callbacks[selected_index], false);
    selected_index = index;
    button.addEventListener(transitionEndedEvent, callbacks[index], false);
    selected_button.classList.remove("selected");
    button.classList.add("selected");
};