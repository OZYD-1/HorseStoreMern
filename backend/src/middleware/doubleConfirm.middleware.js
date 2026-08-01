import { issueConfirmToken, assertConfirmTokenMatches } from "../utils/confirmationToken.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

export function requireDoubleConfirmation(action, messageBuilder) {
  return (req, res, next) => {
    const resource = req.targetResource;
    if (!resource || !resource.id) {
      throw ApiError.internal("the target resource is not properly initialized before double confirmation");
    }

    const providedToken = req.headers["x-confirm-token"] || req.body.confirmToken;

    if (providedToken) {
      let valid = false;
      try {
        valid = assertConfirmTokenMatches(providedToken, {
          action,
          resourceId: resource.id,
          userId: req.user.id,
        });
      } catch (err) {
        valid = false;
      }

      if (!valid) {
        throw ApiError.badRequest(
          "The confirmation token is invalid or has expired, please try again"
        );
      }

      return next();
    }

    const confirmToken = issueConfirmToken({
      action,
      resourceId: resource.id,
      userId: req.user.id,
    });

    const message = messageBuilder
      ? messageBuilder(resource)
      : "This is a sensitive action, are you sure you want to proceed?";

    return new ApiResponse(
      200,
      { requiresConfirmation: true, confirmToken, expiresInMinutes: 5 },
      message
    ).send(res);
  };
}
