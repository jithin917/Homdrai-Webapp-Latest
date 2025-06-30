# Manual Testing Checklist for OMS Issues

## Pre-Test Setup
- [ ] Clear browser cache and cookies
- [ ] Open browser developer tools
- [ ] Navigate to Console tab to monitor errors
- [ ] Navigate to Network tab to monitor API calls
- [ ] Ensure test data exists in database

## Test Session Information
**Date**: ___________  
**Time**: ___________  
**Tester**: ___________  
**Browser**: ___________  
**Version**: ___________  
**OS**: ___________  
**Screen Resolution**: ___________  

## Issue 1: Measurement Form Accessibility

### Test 1.1: Basic Modal Opening
- [ ] Navigate to `/oms/dashboard`
- [ ] Click "New Order" button
- [ ] Modal opens successfully
- [ ] All form sections are visible
- [ ] No console errors appear

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 1.2: Customer Selection and Measurements
- [ ] Click on customer dropdown
- [ ] Select an existing customer
- [ ] Measurement section becomes available
- [ ] Can input measurement values
- [ ] Values persist when switching tabs

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 1.3: New Customer with Measurements
- [ ] Click "+" button to add new customer
- [ ] Fill in customer details
- [ ] Navigate to measurements section
- [ ] Input measurement values
- [ ] Save customer successfully
- [ ] Measurements are saved with customer

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Issue 2: Customer Search Functionality

### Test 2.1: Search by Name
- [ ] Open New Order Modal
- [ ] Click on customer search field
- [ ] Type partial customer name (e.g., "Joh")
- [ ] Search results appear
- [ ] Can select customer from results
- [ ] Customer details populate form

**Search Term**: ___________  
**Results Count**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 2.2: Search by Phone Number
- [ ] Clear search field
- [ ] Type phone number (e.g., "9876")
- [ ] Search results appear
- [ ] Results match phone number
- [ ] Can select customer

**Search Term**: ___________  
**Results Count**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 2.3: Search by Email
- [ ] Clear search field
- [ ] Type email address (e.g., "john@")
- [ ] Search results appear
- [ ] Results match email
- [ ] Can select customer

**Search Term**: ___________  
**Results Count**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 2.4: Empty Search Results
- [ ] Search for non-existent customer
- [ ] "No results found" message appears
- [ ] No errors in console
- [ ] Can still add new customer

**Search Term**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 2.5: Search Performance
- [ ] Type in search field rapidly
- [ ] Search doesn't trigger on every keystroke
- [ ] Results appear within 2 seconds
- [ ] No duplicate API calls in Network tab

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Issue 3: Button Functionality

### Test 3.1: Cancel Button
- [ ] Open New Order Modal
- [ ] Fill in some form data
- [ ] Click "Cancel" button
- [ ] Modal closes immediately
- [ ] Return to dashboard
- [ ] No data is saved

**Data Entered**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 3.2: Close (X) Button
- [ ] Open New Order Modal
- [ ] Fill in some form data
- [ ] Click "X" button in top-right
- [ ] Modal closes immediately
- [ ] Return to dashboard
- [ ] No data is saved

**Data Entered**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 3.3: Save Button Validation
- [ ] Open New Order Modal
- [ ] Leave required fields empty
- [ ] Click "Create Order" button
- [ ] Validation errors appear
- [ ] Modal remains open
- [ ] Focus moves to first error field

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Test 3.4: Successful Order Creation
- [ ] Fill all required fields correctly
- [ ] Click "Create Order" button
- [ ] Success message appears
- [ ] Modal closes
- [ ] New order appears in dashboard
- [ ] Order details are correct

**Order ID Created**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Cross-Browser Testing

### Chrome Testing
- [ ] All tests pass in Chrome
- [ ] No browser-specific issues
- [ ] Performance is acceptable

**Chrome Version**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Firefox Testing
- [ ] All tests pass in Firefox
- [ ] No browser-specific issues
- [ ] Performance is acceptable

**Firefox Version**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Safari Testing (if available)
- [ ] All tests pass in Safari
- [ ] No browser-specific issues
- [ ] Performance is acceptable

**Safari Version**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Mobile Testing

### Mobile Chrome
- [ ] Modal is responsive
- [ ] Touch interactions work
- [ ] Virtual keyboard doesn't break layout
- [ ] All buttons are accessible

**Device**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Mobile Safari (if available)
- [ ] Modal is responsive
- [ ] Touch interactions work
- [ ] Virtual keyboard doesn't break layout
- [ ] All buttons are accessible

**Device**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Accessibility Testing

### Keyboard Navigation
- [ ] Can navigate entire form with Tab key
- [ ] Can close modal with Escape key
- [ ] Focus indicators are visible
- [ ] Tab order is logical

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Screen Reader Testing (if available)
- [ ] Form labels are read correctly
- [ ] Error messages are announced
- [ ] Modal title is announced
- [ ] Button purposes are clear

**Screen Reader**: ___________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Performance Testing

### Load Time
- [ ] Modal opens in < 1 second
- [ ] Customer search results in < 2 seconds
- [ ] Form submission in < 3 seconds
- [ ] No memory leaks detected

**Modal Open Time**: ___________ms  
**Search Response Time**: ___________ms  
**Form Submit Time**: ___________ms  
**Result**: ✅ Pass / ❌ Fail  

## Error Scenarios

### Network Issues
- [ ] Test with slow network connection
- [ ] Test with intermittent connectivity
- [ ] Appropriate error messages shown
- [ ] User can retry operations

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

### Server Errors
- [ ] Test with API returning 500 errors
- [ ] Test with API timeout
- [ ] Graceful error handling
- [ ] User-friendly error messages

**Result**: ✅ Pass / ❌ Fail  
**Notes**: ________________________________

## Final Assessment

### Overall Test Results
**Total Tests**: ___________  
**Passed**: ___________  
**Failed**: ___________  
**Pass Rate**: ___________%  

### Critical Issues Found
1. ________________________________
2. ________________________________
3. ________________________________

### Recommendations
1. ________________________________
2. ________________________________
3. ________________________________

### Sign-off
**Tester Signature**: ___________  
**Date**: ___________  
**Status**: ✅ Approved for Release / ❌ Requires Fixes