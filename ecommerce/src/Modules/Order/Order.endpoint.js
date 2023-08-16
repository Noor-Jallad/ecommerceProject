import { roles } from "../../Middleware/auth.middleware.js";

export const endPoint = {
    create: [roles.Admin, roles.User],
    update: [roles.Admin, roles.User],
    cancel: [roles.Admin, roles.User],
    get : [roles.Admin, roles.User],

}