import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Router } from 'express';
import type { AuthenticatedRequest } from '../types/express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  getCurrentUser,
  requestPasswordReset,
  resetPassword
} from '../controllers/auth.controller';
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
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      await register(req, res);
    } catch (error) {
      next(error);
    }
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
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      await login(req, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token cookie)
 */
router.post('/refresh', (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await refresh(req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 */
router.post('/logout', (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await logout(req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
// Get current user route with proper type assertion
router.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  // Call the controller function and explicitly return void
  getCurrentUser(authReq, res).catch(next);
  
  return; // Explicitly return void
});

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/request-password-reset',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
  ],
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      await requestPasswordReset(req, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      await resetPassword(req, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

export default router;
