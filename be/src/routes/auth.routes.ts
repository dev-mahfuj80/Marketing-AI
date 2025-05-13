import { Router } from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  ((req: Request, res: Response, next: NextFunction) => {
    register(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  ((req: Request, res: Response, next: NextFunction) => {
    login(req, res).catch(next);
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token cookie)
 */
router.post('/refresh', ((req: Request, res: Response, next: NextFunction) => {
  refresh(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 */
router.post('/logout', ((req: Request, res: Response, next: NextFunction) => {
  logout(req, res).catch(next);
}) as RequestHandler);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, ((req: Request, res: Response, next: NextFunction) => {
  getCurrentUser(req, res).catch(next);
}) as RequestHandler);

export default router;
