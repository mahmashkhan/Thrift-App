import Joi from "joi";

export const conversationValidator = Joi.object({
    participantId: Joi.string().required(),
    contextType: Joi.string().optional(),
    contextId: Joi.string().optional()
})