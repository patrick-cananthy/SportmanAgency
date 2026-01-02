# Pre-Deployment Checklist

Use this checklist before deploying to ensure everything is ready.

## Code Preparation

- [ ] All code committed to Git
- [ ] `.env` file created with production values
- [ ] `.gitignore` includes sensitive files (.env, node_modules, uploads)
- [ ] All dependencies listed in `package.json`
- [ ] No hardcoded localhost URLs
- [ ] All API endpoints use relative paths or environment variables

## Environment Variables

- [ ] `DB_HOST` - Database host
- [ ] `DB_USER` - Database username
- [ ] `DB_PASSWORD` - Database password
- [ ] `DB_NAME` - Database name
- [ ] `JWT_SECRET` - Strong random secret key
- [ ] `EMAIL_USER` - Email address
- [ ] `EMAIL_PASS` - Email app password
- [ ] `ALLOWED_ORIGINS` - Production domain(s)
- [ ] `PORT` - Server port (if needed)

## Database

- [ ] Database created on hosting provider
- [ ] Database user created with proper permissions
- [ ] Connection tested
- [ ] Super admin account created
- [ ] Test data removed (if needed)

## Security

- [ ] Default passwords changed
- [ ] Strong JWT_SECRET set
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload limits set
- [ ] Input validation in place

## File Structure

- [ ] `uploads/` directories created:
  - [ ] `uploads/news/`
  - [ ] `uploads/events/`
  - [ ] `uploads/jobs/`
  - [ ] `uploads/talents/`
  - [ ] `uploads/sales-rentals/`
- [ ] File permissions set correctly (755 for folders, 644 for files)

## Testing

- [ ] Frontend loads correctly
- [ ] All pages accessible
- [ ] Admin panel login works
- [ ] User management functions work
- [ ] Content creation works (news, events, jobs, etc.)
- [ ] File uploads work
- [ ] Email sending works (if configured)
- [ ] Contact forms submit correctly
- [ ] Mobile responsive design works

## Performance

- [ ] Images optimized
- [ ] Unused code removed
- [ ] Dependencies minimized
- [ ] Caching configured (if applicable)

## Documentation

- [ ] Deployment guide reviewed
- [ ] Support contacts noted
- [ ] Backup procedures documented

## Post-Deployment

- [ ] Site accessible via domain
- [ ] SSL certificate active
- [ ] All functionality tested
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Team notified of deployment

---

**Ready to Deploy?** Follow the appropriate guide:
- **Netlify**: See `DEPLOYMENT_GUIDE_NETLIFY.md`
- **MyTrueHost**: See `DEPLOYMENT_GUIDE_MYTRUEHOST.md`

