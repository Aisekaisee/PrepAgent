import type { Request, Response, NextFunction } from "express";
import * as assessmentService from "./assessment.service.js";

export async function start(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { topic } = req.body;

        const session = await assessmentService.startSession(userId, topic);

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        next(error);
    }
}

export async function nextQuestion(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const sessionId = String(req.params.id);

        const question = await assessmentService.getNextQuestion(sessionId, userId);

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
}

export async function answer(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const sessionId = String(req.params.id);
        const { questionId, answer: studentAnswer } = req.body;

        const result = await assessmentService.submitAnswer(
            sessionId,
            userId,
            questionId,
            studentAnswer
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export async function submit(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const sessionId = String(req.params.id);

        const result = await assessmentService.finalizeSession(sessionId, userId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export async function history(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await assessmentService.getHistory(userId, { page, limit });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export class AssessmentController {
    start = start;
    nextQuestion = nextQuestion;
    answer = answer;
    submit = submit;
    history = history;
}

export const assessmentController = new AssessmentController();