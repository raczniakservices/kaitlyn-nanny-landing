# Cloudinary Setup Instructions

## ✅ CURRENT STATUS: FULLY WORKING (Dec 18, 2025)

This system is now **production ready** with photos successfully uploading to Cloudinary cloud storage.

## Current Configuration Status

### Cloudinary Dashboard
You have two API keys available:
1. **"Root"** (created Dec 17, 2025) - **CURRENTLY IN USE** ✅
   - API Key: `282821553171294`
   - API Secret: `ICBVM9UvhKV-PQFinthVVrlCO7I`
   
2. **"Untitled"** (created Dec 18, 2025) - Backup
   - API Key: `353371584266971`
   - API Secret: `CkU0JRA3UuxlmS3IH3_RfWxizXY`

- **Cloud Name**: `dkehnwraf`
- **Upload Preset**: `brick_leads` (Unsigned) ✅
- **Photo Folder**: `brick-staining-leads` ✅

### Render.com Environment Variables
**Status**: ✅ CORRECTLY CONFIGURED

---

## ✅ CURRENT WORKING CONFIGURATION

### Render.com Environment Variables (VERIFIED WORKING):
```
CLOUDINARY_URL=cloudinary://282821553171294:ICBVM9UvhKV-PQFinthVVrlCO7I@dkehnwraf
CLOUDINARY_UNSIGNED_UPLOAD_PRESET=brick_leads
ADMIN_PASSWORD=brick2024
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=d2b51d29857f20b4164b407d595fdd0d
```

### Cloudinary Upload Preset Settings:
**Preset Name**: `brick_leads`
- **Signing Mode**: Unsigned ✅
- **Folder**: `brick-staining-leads` ✅
- **Access Mode**: Public
- **Display Name**: "Use the last segment of the public ID as the display Name" ✅

---

## 🔧 IF YOU NEED TO RECREATE THIS SETUP

### 1. Create Upload Preset in Cloudinary
1. Go to: https://console.cloudinary.com
2. Navigate to: **Settings** → **Upload**
3. Scroll to: **Upload presets**
4. Click: **Add upload preset**
5. Configure:
   - **Preset name**: `brick_leads`
   - **Signing mode**: **Unsigned** (CRITICAL!)
   - **Folder**: `brick-staining-leads`
   - **Access mode**: Public
   - **Display name**: "Use the last segment of the public ID as the display Name"
6. Click: **Save**

### 2. Configure Render.com Environment Variables
1. Go to: https://dashboard.render.com
2. Click: **brick-staining-leads** service
3. Click: **Environment** (left sidebar)
4. Set these variables:
   - `CLOUDINARY_URL=cloudinary://282821553171294:ICBVM9UvhKV-PQFinthVVrlCO7I@dkehnwraf`
   - `CLOUDINARY_UNSIGNED_UPLOAD_PRESET=brick_leads`
5. Click: **Save, rebuild, and deploy**
6. Wait 2-3 minutes for deployment

---

## 🔍 Testing After Fix

### Test the Cloudinary Connection
Visit this URL (replace with your admin password):
```
https://brick-staining-leads.onrender.com/api/test-cloudinary?pw=brick2024
```

You should see:
- `configured: true`
- `ping: { success: true }`
- `test_result: { success: true, url: "..." }`

### Test Photo Upload
1. Go to: https://brick-staining-leads.onrender.com
2. Fill out the form
3. Upload a photo
4. Submit the form
5. Check the admin panel to verify photo was uploaded to Cloudinary

---

## ⚠️ TROUBLESHOOTING (Issues We Solved)

### Issue: "Invalid Signature" Error ✅ SOLVED
**What happened**: Spent 3+ hours with this error, tried multiple API keys  
**Root cause**: Signed uploads were too complex and error-prone  
**Solution**: Switched to **unsigned uploads** using upload presets - completely bypasses signature issues

### Issue: "Upload preset not found" ✅ SOLVED
**What happened**: 400 error from Cloudinary  
**Root cause**: Environment variable had wrong preset name (`Lead Uploads` vs `brick_leads`)  
**Solution**: Created preset `brick_leads` in Cloudinary, updated environment variable

### Issue: "Display name cannot contain slashes" ✅ SOLVED
**What happened**: Photos uploading but getting rejected  
**Root causes**: 
1. Folder parameter conflicting with preset folder
2. Cloudinary preset using filename as display name
3. Filenames with spaces/special characters

**Solutions**:
1. Removed folder parameter from code (preset handles it)
2. Added filename sanitization: `replace(/[^a-zA-Z0-9_.-]/g, '_')`
3. Changed preset display name setting

---

## 📝 Technical Details

### CLOUDINARY_URL Format:
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

### Current Production URL:
```
cloudinary://282821553171294:ICBVM9UvhKV-PQFinthVVrlCO7I@dkehnwraf
```

### Critical Rules:
- No spaces anywhere
- No line breaks
- Copy API Secret exactly (case-sensitive)
- Use `@` before cloud name
- Format must be exact or authentication fails

### Why Unsigned Uploads?
- **Simpler**: No signature generation needed
- **Reliable**: Fewer points of failure
- **Secure**: Preset controls what can be uploaded
- **Standard**: Best practice for customer-facing forms

