/**
 * @swagger
 * tags:
 *   - name: Facebook Auth
 *     description: Facebook OAuth login flow
 *   - name: Apple Auth
 *     description: Apple OAuth login flow
 */

/**
 * @swagger
 * /facebook:
 *   get:
 *     tags: [Facebook Auth]
 *     summary: Initiate Facebook login
 *     description: Redirects the user to Facebook's OAuth consent screen. After authorization, Facebook redirects back to the callback URL.
 *     responses:
 *       302:
 *         description: Redirects to Facebook login page
 */

/**
 * @swagger
 * /auth/facebook/callback:
 *   get:
 *     tags: [Facebook Auth]
 *     summary: Facebook OAuth callback
 *     description: Handles the redirect from Facebook after user authorization. On success, redirects to /login-success with a JWT token. On failure, redirects to /login-failed.
 *     responses:
 *       302:
 *         description: Redirects to /login-success?token=xxx or /login-failed
 */

/**
 * @swagger
 * /login-success:
 *   get:
 *     tags: [Facebook Auth]
 *     summary: Login success
 *     description: Returns the JWT token after successful Facebook/Apple login
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Facebook Login Successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: No token provided
 */

/**
 * @swagger
 * /login-failed:
 *   get:
 *     tags: [Facebook Auth]
 *     summary: Login failed
 *     description: Returns error when Facebook login fails
 *     responses:
 *       401:
 *         description: Login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Facebook login failed
 */

/**
 * @swagger
 * /apple:
 *   get:
 *     tags: [Apple Auth]
 *     summary: Initiate Apple login
 *     description: Redirects the user to Apple's OAuth consent screen. Requires HTTPS. After authorization, Apple sends a POST to the callback URL.
 *     responses:
 *       302:
 *         description: Redirects to Apple login page
 */

/**
 * @swagger
 * /auth/apple/callback:
 *   post:
 *     tags: [Apple Auth]
 *     summary: Apple OAuth callback
 *     description: Handles the POST redirect from Apple after user authorization. On success, redirects to /login-success with a JWT token. Note - Apple sends a POST, not GET.
 *     responses:
 *       302:
 *         description: Redirects to /login-success?token=xxx or /login-failed
 */
