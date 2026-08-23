const jsonServer = require('json-server');
const path = require('path');
const express = require('express');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

// Apply default middlewares first (includes bodyParser, cors, logger, etc.)
server.use(middlewares);

// Login route - ensure body is parsed
server.post('/login', express.json(), (req, res) => {
  const dbPath = path.join(__dirname, 'db.json');
  const db = require(dbPath);
  const { email, password } = req.body || {};
  
  const user = db.users?.find(
    u => u.email === email && u.password === password
  );

  if (user) {
    // Create a mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    return res.status(200).json({
      user: { id: user.id, email: user.email, role: user.role || 'user' },
      token
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Authentication middleware for protected routes
server.use((req, res, next) => {
  // Skip auth check for login, /users, and /me routes (handled separately or public)
  if (req.path === '/login' || req.path === '/users') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // For mock purposes, accept any token that starts with 'mock-jwt-token-'
    if (token.startsWith('mock-jwt-token-')) {
      // Attach user info to request for convenience
      const parts = token.split('-');
      if (parts.length >= 4) {
        const userId = parts[3];
        const dbPath = path.join(__dirname, 'db.json');
        const db = require(dbPath);
        const user = db.users?.find(u => String(u.id) === String(userId));
        if (user) {
          req.user = user;
        }
      }
      return next();
    }
  }
  
  // If no valid token, return 401
  return res.status(401).json({ message: 'Unauthorized' });
});

// Get available users endpoint (without passwords)
server.get('/users', (req, res) => {
  const dbPath = path.join(__dirname, 'db.json');
  const db = require(dbPath);
  const users = db.users || [];
  
  const frontEndUsers = users.map(u => ({
    id: String(u.id),
    username: u.email.split('@')[0],
    email: u.email,
    departmentId: 'dept-001',
    firstName: u.role === 'admin' ? 'Admin' : 'User',
    lastName: u.role === 'admin' ? 'User' : '',
    status: 'ready'
  }));
  
  res.status(200).json(frontEndUsers);
});

// Get current user info endpoint
server.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Map db user to frontend User format
  const dbUser = req.user;
  const frontEndUser = {
    id: String(dbUser.id),
    username: dbUser.email.split('@')[0],
    email: dbUser.email,
    departmentId: 'dept-001',
    firstName: dbUser.role === 'admin' ? 'Admin' : 'User',
    lastName: dbUser.role === 'admin' ? 'User' : '',
    status: 'ready'
  };
  
  res.status(200).json(frontEndUser);
});

// Use the router
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server with Mock Auth is running on port 3001');
});
