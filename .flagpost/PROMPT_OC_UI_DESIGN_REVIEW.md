# 10X PROMPT: UI/UX Design Review & Element Placement Validation

**Assigned To:** OC (Kimi K2.5)
**Priority:** HIGH
**Timeline:** Before full-stack integration
**Estimated Time:** 45-60 minutes
**Success Criteria:** Design review complete, all artifacts documented, fixes identified

---

## Executive Summary

You are tasked with conducting a comprehensive UI/UX design review of the hex-ade frontend locally. Focus on element placements, visual hierarchy, responsiveness, and specific design issues identified in previous testing. This is a critical quality gate before production deployment.

**You have authority to:**
- Make design recommendations
- Identify layout issues
- Suggest component repositioning
- Document visual artifacts
- Flag accessibility concerns
- Recommend refinements

---

## Phase 1: Environment Setup (5 minutes)

### 1.1 Start Development Server
```bash
cd /home/kellyb_dev/projects/hex-ade
pnpm dev
# Frontend should run on http://localhost:3000
```

### 1.2 Verify Frontend Load
- ✅ Page loads without errors
- ✅ No console errors (F12 → Console tab)
- ✅ Responsive design works (test browser zoom levels)
- ✅ All navigation routes accessible

### 1.3 Browser Setup for Testing
- Use Chrome/Edge for primary testing (best dev tools)
- Test window sizes: 1920x1080 (desktop), 1366x768 (laptop), 768x1024 (tablet)
- Enable mobile responsive mode (F12 → Device toolbar)
- Screenshot each view for documentation

---

## Phase 2: Element Placement Analysis (20 minutes)

### 2.1 Page Layout Structure

**Home/Landing Page (`/`)**
- [ ] Header positioning: Top of viewport? Sticky or fixed?
- [ ] Logo placement: Left alignment? Proper padding from edges?
- [ ] Navigation menu: Horizontal top bar? Mobile hamburger menu?
- [ ] Main hero section: Centered? Proper vertical spacing?
- [ ] CTA buttons: Visible without scroll? Adequate padding?
- [ ] Footer: Sticky bottom or content-relative?

**Projects Page (`/projects`)**
- [ ] Page title positioning: Proper hierarchy? Left-aligned?
- [ ] "New Project" button: Right side? Easily discoverable?
- [ ] Projects list/grid: Proper spacing between items?
- [ ] Cards/items: Consistent heights? Aligned margins?
- [ ] Search/filter bar: Top or sidebar? Mobile-responsive?
- [ ] Pagination/scrolling: Clear indicators? Smooth?

**Project Detail Page**
- [ ] Breadcrumb navigation: Visible? Proper nesting?
- [ ] Project title: Prominent? Proper font sizing?
- [ ] Tabs/sections: Clear visual separation? Active state obvious?
- [ ] Feature list: Organized? Proper indentation/hierarchy?
- [ ] Action buttons: Create, Edit, Delete - proper placement?
- [ ] Stats panel: Right sidebar or top? Good info hierarchy?

**New Project Form**
- [ ] Form labels: Above or beside inputs? Consistent?
- [ ] Input fields: Proper width? Mobile-friendly?
- [ ] Required field indicators: Visible? (red asterisk, etc.)
- [ ] Help text/tooltips: Accessible? Not blocking content?
- [ ] Submit/Cancel buttons: Clear contrast? Bottom or inline?
- [ ] Error messages: Inline or top banner? Obvious?

### 2.2 Spacing & Alignment

- [ ] Horizontal margins: Consistent across all pages (16px, 32px standard)?
- [ ] Vertical spacing: Proper rhythm between sections (top/bottom)?
- [ ] Component padding: Inputs, buttons, cards - consistent internal spacing?
- [ ] Alignment: Left-aligned text? Centered containers properly centered?
- [ ] White space: Not cramped? Breathing room between elements?

### 2.3 Visual Hierarchy

- [ ] Font sizes: H1 > H2 > H3 > body? Clear progression?
- [ ] Font weights: Bold for headings? Regular for body text?
- [ ] Color contrast: Text readable on background? WCAG AA minimum?
- [ ] Icon sizing: Proportional to adjacent text? Clear visibility?
- [ ] Emphasis: Important elements stand out? Secondary items de-emphasized?

---

## Phase 3: Previous Issue Investigation (15 minutes)

### 3.1 Reported Artifacts - Investigate & Document

**Issue 1: Screen Content Chopped at Top**
- [ ] Inspect: Does header cut off any content?
- [ ] Test: Fixed header causing overlap? Measure pixels lost
- [ ] Document: Screenshot showing the issue
- [ ] Investigate: CSS `position: fixed` or `overflow: hidden`?
- [ ] Measurement: How many pixels are hidden?

**Issue 2: Layout Shifted/Pixel Artifacts**
- [ ] Inspect: Are elements misaligned on scroll?
- [ ] Test: Do elements jump when page loads?
- [ ] Document: Screenshot at different zoom levels (100%, 110%, 90%)
- [ ] Investigate: Flexbox vs Grid alignment issues?
- [ ] Check: Right margin/padding causing horizontal scroll?

**Issue 3: Responsive Design Breakpoints**
- [ ] Test: Tablet (768px width) - does layout break?
- [ ] Test: Mobile (375px width) - usable on phone?
- [ ] Test: Large screen (1920px) - does content spread too thin?
- [ ] Document: Which breakpoints need attention?
- [ ] Check: Touch targets adequate (44px minimum)?

---

## Phase 4: Component-Level Analysis (15 minutes)

### 4.1 Navigation Components
- [ ] Mobile menu: Works? Hamburger icon clear?
- [ ] Active links: Highlighted properly? Obvious current page?
- [ ] Hover states: Visible feedback on desktop?
- [ ] Accessibility: Keyboard navigation works?

### 4.2 Form Components
- [ ] Input focus: Clear focus indicator (blue outline)?
- [ ] Labels: Associated with inputs (for/id attributes)?
- [ ] Validation: Error states visible? Success states?
- [ ] Buttons: Hover state? Active state during submission?

### 4.3 List/Table Components
- [ ] Headers: Bold? Proper alignment?
- [ ] Rows: Proper alternating? Hover state?
- [ ] Truncation: Text overflow handling? Ellipsis or wrap?
- [ ] Actions: Edit/Delete buttons placement? Accessible?

### 4.4 Cards/Panels
- [ ] Shadow/elevation: Consistent depth? Modern or dated?
- [ ] Border radius: Rounded corners? Consistent?
- [ ] Content padding: Breathing room inside? Not cramped?
- [ ] Typography: Titles, subtitles, body - proper hierarchy?

---

## Phase 5: Responsive & Cross-Browser Testing (10 minutes)

### 5.1 Desktop (1920x1080)
- [ ] Full-width layout: Proper max-width? Content readable?
- [ ] Sidebar: Visible and useful? Not wasted space?
- [ ] Right/left margins: Balanced? Adequate padding?

### 5.2 Laptop (1366x768)
- [ ] Content accessible without horizontal scroll?
- [ ] Sidebar collapses if present?
- [ ] Text readable? Font sizes adequate?

### 5.3 Tablet (768x1024)
- [ ] Touch-friendly buttons (44px+ height)?
- [ ] Layout stacks vertically if needed?
- [ ] Navigation accessible (hamburger or dropdown)?
- [ ] Forms usable with touch keyboard?

### 5.4 Mobile (375x667)
- [ ] Single column layout? No horizontal scroll?
- [ ] Buttons stacked or side-by-side? Adequate spacing?
- [ ] Navigation: Hamburger menu works?
- [ ] Forms: Mobile keyboard doesn't hide content?

### 5.5 Browser Testing
- [ ] Chrome: Baseline (latest version)
- [ ] Firefox: Any rendering differences?
- [ ] Safari: Any layout shifts?
- [ ] Edge: Compatibility check

---

## Phase 6: Accessibility Review (10 minutes)

- [ ] Color contrast: Use DevTools contrast checker
- [ ] Keyboard navigation: Tab through all elements - logical order?
- [ ] Screen reader: Check if labels work (ARIA attributes present?)
- [ ] Focus indicators: Always visible when tabbing?
- [ ] Form validation: Error messages announced?
- [ ] Images: Alt text present? Meaningful descriptions?

---

## Phase 7: Documentation & Findings (5 minutes)

### 7.1 Create Detailed Report

Document findings in this format:

```
## UI/UX Design Review - Findings Report

### CRITICAL ISSUES (Must Fix Before Production)
1. [Issue Name]
   - Location: [Page/Component]
   - Description: [What's wrong]
   - Impact: [User impact]
   - Recommendation: [How to fix]
   - Screenshot: [Attach if possible]

### HIGH PRIORITY (Fix Soon)
1. [Issue Name]
   - ...

### MEDIUM PRIORITY (Nice to Have)
1. [Issue Name]
   - ...

### POSITIVE OBSERVATIONS
- [What looks good]
- [Elements working well]

### RECOMMENDATIONS FOR FUTURE
- [Improvements to consider]
- [Polish items]

### SCREENSHOTS ATTACHED
- Desktop: [1920x1080 screenshot]
- Tablet: [768x1024 screenshot]
- Mobile: [375x667 screenshot]
```

### 7.2 Severity Classification

**CRITICAL:** Blocks user workflow, broken layout, security issue
**HIGH:** Affects usability, major visual bug, accessibility issue
**MEDIUM:** Minor visual issues, non-standard but usable
**LOW:** Polish, future enhancements, nice-to-have

---

## Phase 8: Actionable Next Steps

### 8.1 If Major Issues Found
```
1. Document each issue with screenshot
2. Provide specific fix recommendations
3. Identify which component needs changes
4. Flag for priority implementation
```

### 8.2 If Minor Issues Found
```
1. List as "Polish Items"
2. Suggest improvements
3. Recommend timing: Now vs. Future
4. Document in design system notes
```

### 8.3 If No Issues Found
```
1. Document that review is COMPLETE
2. Sign off on design quality
3. Recommend proceeding to production
```

---

## Expected Deliverables

### Document to Create:
**File:** `.flagpost/UI_UX_REVIEW_FINDINGS.md`

### Content Includes:
- [ ] Executive summary of findings
- [ ] Critical issues with fixes
- [ ] Component analysis results
- [ ] Responsive design assessment
- [ ] Accessibility compliance status
- [ ] Screenshots of issues (if any)
- [ ] Overall design quality score
- [ ] Recommendation for production readiness

### Report Format:
```
# UI/UX Design Review - Complete Report

**Reviewed Date:** 2026-02-04
**Reviewer:** OC (Kimi K2.5)
**Overall Status:** ✅ READY FOR PRODUCTION / ⚠️ NEEDS FIXES

## Executive Summary
[2-3 sentence summary]

## Detailed Findings
### Critical Issues: [X] found
### High Priority: [X] found
### Medium Priority: [X] found

## Screenshots & Evidence
[Attach images showing issues]

## Recommendations
[List recommended fixes in priority order]

## Production Readiness
✅ Approved / ⚠️ Conditional / ❌ Not Ready
```

---

## Success Criteria - You're Done When:

✅ All pages tested (home, projects, project detail, new project)
✅ Responsive design verified (desktop, tablet, mobile)
✅ Element placements documented with screenshots
✅ Previous issues investigated and status determined
✅ Accessibility basics checked (contrast, keyboard, focus)
✅ Detailed findings report created
✅ Clear recommendations provided (fix, polish, or approved)
✅ Production readiness assessment given

---

## Notes

- **Take screenshots:** Document every finding with visual evidence
- **Be specific:** Not "layout looks off" but "header cuts 15px of content"
- **Prioritize:** What must be fixed now vs. future polish
- **Browser DevTools:** Use F12 inspector to measure elements
- **Mobile testing:** Chrome DevTools has excellent mobile simulator
- **Accessibility:** WAVE browser extension helps with contrast/ARIA checks
- **Reference:** Current design system/brand guidelines if available

---

## Timeline

```
Start: Now
├─ Phase 1 (Setup): 5 min
├─ Phase 2 (Analysis): 20 min
├─ Phase 3 (Issues): 15 min
├─ Phase 4 (Components): 15 min
├─ Phase 5 (Responsive): 10 min
├─ Phase 6 (Accessibility): 10 min
├─ Phase 7 (Report): 5 min
└─ Complete: ~90 minutes total

Deliverable: `.flagpost/UI_UX_REVIEW_FINDINGS.md`
```

---

## Your Authority

You have full authority to:
- ✅ Make design recommendations
- ✅ Identify component issues
- ✅ Suggest layout improvements
- ✅ Flag accessibility problems
- ✅ Recommend priority fixes
- ✅ Sign off on design quality

This is YOUR review - be thorough, be specific, be critical where needed.

---

## Questions to Guide Your Review

**As you test, ask yourself:**

1. **Discoverability:** Can a new user find everything they need?
2. **Clarity:** Is it obvious what each element does?
3. **Hierarchy:** Do important things stand out?
4. **Consistency:** Do similar components look/behave the same?
5. **Responsiveness:** Does it work on all screen sizes?
6. **Accessibility:** Can keyboard users navigate? Can screen readers work?
7. **Feedback:** When I interact with something, do I get clear feedback?
8. **Error Handling:** If I make a mistake, is it clear what to do?
9. **Performance:** Does the interface feel snappy or laggy?
10. **Polish:** Does it feel professional or rough around edges?

---

## Output Format

When you complete this review, provide:

1. **Status Report** (in Slack/chat)
   - ✅ Review complete: [Date/Time]
   - 🔴 Critical issues: [Count]
   - 🟡 High priority: [Count]
   - 📋 Findings saved to: `.flagpost/UI_UX_REVIEW_FINDINGS.md`
   - 🎯 Recommendation: [APPROVED / NEEDS FIXES / CONDITIONAL]

2. **Detailed Report** (in .flagpost file)
   - Full findings with screenshots
   - Priority-ordered recommendations
   - Specific fix suggestions
   - Production readiness assessment

---

**Ready to review? Start with Phase 1 - let's make sure this UI is production-quality! 🎨**

