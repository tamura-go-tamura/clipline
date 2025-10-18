"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPermission = exports.BotPrompt = void 0;
const react_native_1 = require("react-native");
var BotPrompt;
(function (BotPrompt) {
    /** Opens a new screen to add a LINE Official Account as a friend after the user agrees to the permissions in the consent screen. */
    BotPrompt["Aggressive"] = "aggressive";
    /** Includes an option to add a LINE Official Account as a friend in the consent screen. */
    BotPrompt["Normal"] = "normal";
})(BotPrompt || (exports.BotPrompt = BotPrompt = {}));
var LoginPermission;
(function (LoginPermission) {
    LoginPermission["Email"] = "email";
    /** To get an ID token in the login response. */
    LoginPermission["OpenId"] = "openid";
    /** To get user's profile including the user ID, display name, and the profile image URL in the login response. */
    LoginPermission["Profile"] = "profile";
})(LoginPermission || (exports.LoginPermission = LoginPermission = {}));
exports.default = react_native_1.TurboModuleRegistry.getEnforcing('LineLogin');
