import { message } from "antd";
const success = (content = "Success") => {
    message.success(content);
};
const error = (content = "Error") => {
    message.error(content);
};
const warning = (content = "Warning") => {
    message.warning(content);
};
const info = (content = "Info") => {
    message.info(content);
};
export { success, error, warning, info };
