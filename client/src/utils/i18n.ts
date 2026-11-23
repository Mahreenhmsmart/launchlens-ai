/**
 * i18n — Roman Urdu translation support for LaunchLens AI.
 *
 * Provides a `useTranslation()` hook that returns a `t(key)` function.
 * The `t()` function looks up the current language from the Redux store
 * and returns the Roman Urdu translation if available, otherwise falls
 * back to the English key itself (graceful degradation).
 */

import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { Language } from '@/store/slices/uiSlice';

// ─── Translation Dictionary ────────────────────────────────────────────────
// Keys are English strings; values are their Roman Urdu equivalents.
// Keep brand names (LaunchLens AI), technical terms (ROAS, COD, RTO, KPI),
// numbers, PKR, courier names, and city names in English.

export const translations: Record<string, string> = {
  // ── Navigation & Common UI ──────────────────────────────────────────────
  'Dashboard': 'Dashboard',
  'Home': 'Ghar',
  'Features': 'Khusoosiyat',
  'About': 'Hamare Baray Mein',
  'Contact': 'Rabta',
  'FAQ': 'Aksar Poochay Janay Walay Sawalaat',
  'Privacy Policy': 'Raazdari Ki Policy',
  'Terms of Service': 'Khidmat Ki Sharait',
  'Settings': 'Settings',
  'Help': 'Madad',
  'Search': 'Talash',
  'Filter': 'Filter',
  'Compare': 'Muqabla',
  'Next': 'Agla',
  'Previous': 'Pichla',
  'Close': 'Band Karein',
  'Yes': 'Haan',
  'No': 'Nahi',
  'Save': 'Save Karein',
  'Delete': 'Delete Karein',
  'Cancel': 'Radd Karein',
  'Submit': 'Jama Karein',
  'Back': 'Wapis',
  'Skip for now': 'Abhi Chhor Dein',
  'Finish Setup': 'Setup Mukammal Karein',

  // ── Auth & User ─────────────────────────────────────────────────────────
  'Login': 'Login',
  'Logout': 'Logout',
  'Get Started Free': 'Muft Shuru Karein',
  'Get Started': 'Shuru Karein',
  'Sign Up': 'Sign Up',
  'Name': 'Naam',
  'Email': 'Email',
  'Password': 'Password',

  // ── Pricing & Plans ─────────────────────────────────────────────────────
  'Pricing': 'Qeematein',
  'Plan': 'Plan',
  'Monthly': 'Mahana',
  'Yearly': 'Salana',
  'Subscribe': 'Subscribe Karein',
  'Upgrade': 'Upgrade',
  'Free': 'Muft',
  'Basic': 'Basic',
  'Pro': 'Pro',
  'Standard': 'Standard',
  'Business': 'Business',
  'per month': 'mah',
  'per year': 'fi saal',
  'Choose Your Plan': 'Apna Plan Chunein',
  'Current Plan': 'Mojooda Plan',
  'Most Popular': 'Sab Se Maqbool',
  'Upgrade Plan': 'Plan Upgrade Karein',
  'Choose Business': 'Business Chunein',
  'View Plans': 'Plans Dekhein',
  'Start free. Upgrade when you\'re ready.': 'Muft shuru karein. Jab tayyar hon upgrade karein.',

  // ── Product & Financial Terms ───────────────────────────────────────────
  'Revenue': 'Aamdani',
  'Profit': 'Munafa',
  'Loss': 'Nuqsan',
  'Orders': 'Orders',
  'Launch': 'Launch',
  'Product': 'Product',
  'Price': 'Qeemat',
  'Cost': 'Laagat',
  'Selling Price': 'Farokht Ki Qeemat',
  'Product Cost': 'Product Ki Laagat',
  'Delivery Cost': 'Delivery Ki Laagat',
  'Other Costs': 'Deegar Kharchay',
  'Total Cost': 'Kul Laagat',
  'Ad Budget': 'Ishtihari Budget',
  'Expected Orders': 'Mutawaqqa Orders',
  'Product Name': 'Product Ka Naam',
  'Category': 'Category',

  // ── Simulator & Analysis ────────────────────────────────────────────────
  'Simulator': 'Simulator',
  'Launch Simulator': 'Launch Simulator',
  'New Simulation': 'Naya Simulation',
  'New': 'Naya',
  'Latest Simulation': 'Taza Tareen Simulation',
  'Latest Simulation KPIs': 'Taza Tareen Simulation KPIs',
  'Recent Analyses': 'Haaliya Tajziye',
  'Saved Analyses': 'Mehfooz Tajziye',
  'Contribution per Order': 'Har Order Par Hissa',
  'Contribution / Order': 'Har Order Par Hissa',
  'Break-Even ROAS': 'Break-Even ROAS',
  'Delivery Rate': 'Delivery Ki Sharah',
  'Run Simulation': 'Simulation Chalayein',
  'Calculate Profit': 'Munafa Calculate Karein',
  'Reset': 'Reset',
  'Save Analysis': 'Tajziya Save Karein',
  'Export PDF': 'PDF Export Karein',
  'Share on WhatsApp': 'WhatsApp Par Share Karein',

  // ── Decision Engine ─────────────────────────────────────────────────────
  'Decision Engine': 'Faisla Engine',
  'Product Launch Decision Engine': 'Product Launch Faisla Engine',
  'Launch Readiness': 'Launch Ki Tayyari',
  'Explore Decision Engine': 'Faisla Engine Dekhein',
  'Try Decision Engine': 'Faisla Engine Azmayein',

  // ── Scenarios ───────────────────────────────────────────────────────────
  'Scenarios': 'Manzar Namay',

  // ── Checklist ───────────────────────────────────────────────────────────
  'Readiness Checklist': 'Tayyari Ki Checklist',

  // ── AI & Insights ───────────────────────────────────────────────────────
  'AI Insights': 'AI Tajziye',
  'AI Advisor': 'AI Mashir',
  'Get AI Insights': 'AI Tajziye Haasil Karein',

  // ── Product Discovery ───────────────────────────────────────────────────
  'Product Discovery': 'Product Ki Talash',
  'Discover Trends': 'Trends Daryaft Karein',
  'TrendScout': 'TrendScout',

  // ── COD Calculator ──────────────────────────────────────────────────────
  'COD/RTO Calculator': 'COD/RTO Calculator',
  'Courier': 'Courier',
  'Weight': 'Wazan',
  'Zone': 'Zone',
  'Order Value': 'Order Ki Qeemat',
  'Cheapest': 'Sab Se Sasta',
  'Destination City': 'Manzil Shehar',

  // ── Overview Page Sections ──────────────────────────────────────────────
  'Premium Tools': 'Behtareen Auzaar',
  'How It Works': 'Yeh Kaise Kaam Karta Hai',
  'About LaunchLens AI': 'LaunchLens AI Ke Baray Mein',
  'Why LaunchLens AI': 'LaunchLens AI Kyun',
  'See LaunchLens AI in Action': 'LaunchLens AI Ko Amal Mein Dekhein',
  'Ready to Launch Smarter?': 'Hoshiyari Se Launch Karne Ko Tayyar?',
  'Frequently Asked Questions': 'Aksar Poochay Janay Walay Sawalaat',
  'Watch Demo': 'Demo Dekhein',
  'Watch again': 'Dobara Dekhein',
  'Loading video...': 'Video load ho rahi hai...',
  'Calculate Profitability': 'Munafa Awarzi Calculate Karein',

  // ── Feature Descriptions ────────────────────────────────────────────────
  'Understand whether your product is ready to launch, needs testing or should be reconsidered.':
    'Janain ke aap ka product launch ke liye tayyar hai, test ki zaroorat hai ya dobara ghour karna chahiye.',
  'Calculate expected profit, delivery risks, break-even CPA and ROAS.':
    'Mutawaqqa munafa, delivery ke khatraat, break-even CPA aur ROAS calculate karein.',
  'Discover trending products and market opportunities with AI-powered insights.':
    'AI ki madad se trending products aur market ke mauqay daryaft karein.',
  'Get actionable AI-powered recommendations for pricing, positioning, and campaigns.':
    'Qeemat, positioning aur campaigns ke liye AI se amal dar amad mashwarey haasil karein.',
  'Model different scenarios and predict outcomes before investing in ads.':
    'Ads mein sarmaya lagane se pehle mukhtalif manzar namay banayein aur nataij ki peshangoi karein.',

  // ── New Feature Cards ──────────────────────────────────────────────────────
  'Track predicted vs actual profit, ROAS and delivery rate after your launch — see the variance, launch by launch.':
    'Apni launch ke baad peshangoi aur haqiqi munafa, ROAS aur delivery rate ka muqabla karein — har launch ka farq dekhein.',
  'Track Profit': 'Munafa Track Karein',
  'WhatsApp Verdict Sharing': 'WhatsApp Par Faisla Share Karna',
  'Share your GO / NO-GO launch verdict on WhatsApp as a clean verdict card with your real figures.':
    'Apna GO / NO-GO launch faisla WhatsApp par ek saaf verdict card ke tor par apne haqiqi adad ke saath share karein.',
  'Share Verdict': 'Faisla Share Karein',
  'Launch Scenarios': 'Launch Manzar Namay',
  'Compare Conservative, Expected and Optimistic launch outcomes side by side before you spend.':
    'Kharcha karne se pehle Conservative, Expected aur Optimistic launch nataij ka pehlu ba pehlu muqabla karein.',
  'Compare Scenarios': 'Manzar Namon Ka Muqabla',
  'Check your launch readiness step by step, from product to pricing to ads.':
    'Apni launch tayyari ko qadam ba qadam jaanchain — product se lekar qeemat aur ads tak.',
  'Check Readiness': 'Tayyari Jaanchain',
  'Powerful features to help you make smarter launch decisions.':
    'Zabardast khusoosiyat jo aap ko behtar launch faislay karne mein madad karti hain.',
  'Three simple steps to smarter product launches.':
    'Teen asaan qadam hoshiyar product launches ke liye.',
  'Built for e-commerce entrepreneurs who want to launch with confidence.':
    'Un e-commerce karobariyon ke liye jo pur-aitmaad launch karna chahte hain.',
  'The competitive edge every e-commerce seller needs.':
    'Wo fawaida jo har e-commerce seller ko chahiye.',
  'Everything you need to know about LaunchLens AI.':
    'LaunchLens AI ke baray mein sab kuch jo aap ko janna chahiye.',
  'From Product Idea to Smarter Launch Decisions.':
    'Product ke khayal se hoshiyar launch faison tak.',
  'Make data-driven launch decisions with LaunchLens AI.':
    'LaunchLens AI ke zariye data par mabni launch faislay karein.',

  // ── How It Works Steps ──────────────────────────────────────────────────
  'Enter Product Details': 'Product Ki Tafseelat Darj Karein',
  'Input your product cost, pricing, and target market parameters.':
    'Apni product ki laagat, qeemat aur target market ke parameters darj karein.',
  'Get Profitability Insights': 'Munafa Awarzi Ke Tajziye Haasil Karein',
  'Our engine calculates margins, break-even points, and delivery risk factors.':
    'Humara engine margins, break-even points aur delivery ke khatraat calculate karta hai.',
  'Make a Smarter Launch Decision': 'Behtar Launch Faisla Karein',
  'Get actionable insights to launch with confidence or pivot before spending.':
    'Amal dar amad tajziye haasil karein taake pur-aitmaad launch karein ya kharcha karne se pehle ruk jaayen.',

  // ── About Section ───────────────────────────────────────────────────────
  'What We Do': 'Hum Kya Karte Hain',
  'Who It\'s For': 'Yeh Kis Ke Liye Hai',
  'Our Mission': 'Humara Maqsad',

  // ── Why Choose Us Benefits ──────────────────────────────────────────────
  'Data-Driven Decisions': 'Data Par Mabni Faislay',
  'Stop guessing. Use real financial modeling to evaluate product viability before investing in ads.':
    'Andaza lagana band karein. Ads mein sarmaya lagane se pehle product ki feasibility jaanchne ke liye haqiqi financial modeling istemal karein.',
  'COD Market Expertise': 'COD Market Ki Maharat',
  'Built specifically for Cash on Delivery markets where return rates and delivery success directly impact profitability.':
    'Khaas tor par Cash on Delivery markets ke liye banaya gaya jahan return rates aur delivery ki kamiyabi seedha munafa awarzi par asar daalti hai.',
  'Risk Assessment': 'Khatraat Ka Jaiza',
  'Understand delivery risks, break-even points, and worst-case scenarios before committing budget.':
    'Budget lagane se pehle delivery ke khatraat, break-even points aur buray tareen manzar namay samjhein.',
  'Profit Optimization': 'Munafa Behtar Banana',
  'Identify the optimal pricing strategy and ad spend allocation to maximize your return on investment.':
    'Apni sarmaya-guzari par ziyada se ziyada wapsi ke liye behtareen qeemat ki hikmat-e-amli aur ad spend taqseem ki nishandahi karein.',
  'AI-Powered Insights': 'AI Se Tajziye',
  'Get actionable recommendations for pricing, positioning, and campaign testing powered by AI.':
    'Pricing, positioning aur campaign testing ke liye AI-powered mashware hasil karein.',
  'Fast Analysis': 'Tez Tajziya',
  'Go from product idea to launch decision in minutes, not days. Save time and move faster than competitors.':
    'Product ke khayal se launch faisle tak minton mein pohanchain, dinon mein nahi. Waqt bachayein aur muqablon se tez aagay barhein.',

  // ── Onboarding ──────────────────────────────────────────────────────────
  'Set Up Your Product': 'Apna Product Set Up Karein',
  'Tell us about your first product so all tools start with real numbers.':
    'Apne pehle product ke baray mein batayein taake tamam tools haqiqi adad se shuru hon.',
  'Product Basics': 'Product Ki Bunyadi Baatein',
  'Cost Breakdown': 'Laagat Ki Tafseel',
  'Market & Orders': 'Market Aur Orders',
  'Target Market': 'Target Market',
  'Step': 'Qadam',
  'We\'ll use a demo product to get you started.':
    'Hum aap ko shuru karne ke liye demo product istemal karenge.',

  // ── Footer ──────────────────────────────────────────────────────────────
  'Quick Links': 'Tez Rabtay',
  'Questions or feedback? Reach out to us at': 'Sawaalaat ya raaye? Hum se rabta karein',
  'Chat on WhatsApp': 'WhatsApp Par Baat Karein',
  'All rights reserved.': 'Jumla huqooq mehfooz hain.',
  'Helping e-commerce entrepreneurs make smarter product launch decisions with data-driven insights.':
    'E-commerce karobariyon ko data par mabni tajziyon se behtar product launch faislay karne mein madad.',
  'LaunchLens AI is a product launch intelligence platform built for e-commerce sellers in COD markets. We help you evaluate profitability, assess delivery risks, and make confident launch decisions before spending on ads.':
    'LaunchLens AI ek product launch intelligence platform hai jo COD markets mein e-commerce sellers ke liye banaya gaya hai. Hum aap ko munafa awarzi ka jaiza, delivery ke khatraat ki jaanch aur ads par kharcha karne se pehle pur-aitmaad launch faislay karne mein madad karte hain.',

  // ── Misc ────────────────────────────────────────────────────────────────
  'Manage Subscription': 'Subscription Manage Karein',
  'Admin Panel': 'Admin Panel',
  'Payment Pending': 'Payment Intezaar Mein',
  'Active': 'Fa\'aal',
  'Cancelled': 'Mansookh',
  'Pending payment setup': 'Payment setup intezar mein',
  'Next billing:': 'Agli billing:',
  'Member': 'Member',
  'Administrator': 'Administrator',
  'User': 'User',
  'Full Analysis': 'Mukammal Tajziya',
  'Quick Results': 'Tez Nataij',
  'Comprehensive Metrics Evaluated': 'Jamai Metrics Ka Jaiza',
  'Fast Product Analysis': 'Tez Product Tajziya',
  'Courier Rates by City': 'Shehar Ke Hisaab Se Courier Rates',
  'Indicative delivery costs for a standard 1 kg parcel. Researched Nov 2026.':
    '1 kg ke maayi parcel ke liye isharaati delivery kharchay. Tehqeeq Nov 2026.',
  'Rates are indicative and may vary. Last updated: Nov 2026.':
    'Rates isharaati hain aur tabdeel ho sakte hain. Aakhri update: Nov 2026.',
  'Compare our courier rates': 'Humare courier rates ka muqabla karein',
  'Save up to 21%': '21% tak bachat',
  'Save 20%': '20% Bachat',
  '/mo equivalent': '/mah barabar',
  '{price}/mo equivalent · {savings}': '{price}/mah barabar · {savings}',
  'Unlock the right tools to research smarter, build faster, and grow with AI.':
    'Behtar tehqeeq, tez tarmeem aur AI ke saath barhne ke liye sahi tools unlock karein.',
  'Dashboard figures shown are an illustrative example using the demo product (Premium Skincare Serum).':
    'Dashboard ke adad misali hain jo demo product (Premium Skincare Serum) par mabni hain.',

  // ── Launch Simulator Page ───────────────────────────────────────────────
  'Model your product economics and predict campaign profitability.':
    'Apni product ki maliyat ka jaiza lein aur campaign ki munafa awarzi ki peshangoi karein.',
  'Export Report': 'Report Export Karein',
  'requires Standard or Business plan': 'Standard ya Business plan zaroori hai',
  'Share': 'Share Karein',
  'Share Verdict on WhatsApp': 'WhatsApp Par Faisla Share Karein',
  'Values are automatically converted when you change currency. Enter amounts in your selected currency.':
    'Currency tabdeel karne par values khud ba khud convert ho jati hain. Apni muntakhab currency mein raqmein darj karein.',
  'Calculate Now': 'Abhi Calculate Karein',
  'Simulation Inputs': 'Tajziye Ke Inputs',
  'Clear': 'Saaf Karein',
  'Reset to Demo': 'Demo Par Reset',
  'Enter product name': 'Product ka naam likhein',
  'Courier Cost Calculator': 'Courier Kharcha Calculator',
  'Enable auto-calc': 'Auto-calc chalu karein',
  'Manual override': 'Manual override',
  'Weight (kg)': 'Wazan (kg)',
  'Auto-calculated:': 'Khud ba khud calculate:',
  'delivery cost': 'delivery kharcha',
  'RTO Shipping Cost': 'RTO Shipping Kharcha',
  'Cost per returned order (used for break-even)': 'Har wapis order ka kharcha (break-even ke liye)',
  'Other Variable Costs': 'Deegar Mutaghayyir Kharchay',
  'Advertising Budget': 'Ishtihari Budget',
  'Delivery Success Rate (%)': 'Delivery Kamyabi Ki Sharah (%)',
  'Estimated Revenue': 'Mutawaqqa Aamdani',
  'Campaign Profit/Loss': 'Campaign Munafa/Nuqsan',
  'Profitable campaign': 'Munafa awar campaign',
  'Loss-making campaign': 'Nuqsan deh campaign',
  'Contribution Per Order': 'Har Order Par Hissa',
  'Detailed Breakdown': 'Tafseeli Jaiza',
  'Total Variable Costs': 'Kul Mutaghayyir Kharchay',
  'Contribution Before Advertising': 'Ishtihar Se Pehlay Hissa',
  'Contribution Margin': 'Hissa Margin',
  'Campaign Outlook: Positive': 'Campaign Ka Manzar Nama: Musbat',
  'Campaign Outlook: Negative': 'Campaign Ka Manzar Nama: Manfi',
  // Campaign summary sentence templates — {orders}, {price}, {profit}, {adSpend} are interpolated at runtime
  'With {orders} orders at {price} each, your campaign generates {profit} profit after {adSpend} ad spend.':
    '{orders} orders par {price} har ek, aap ki campaign {adSpend} ad kharchay ke baad {profit} munafa deti hai.',
  'With {orders} orders at {price} each, your campaign loses {profit} after {adSpend} ad spend. Consider adjusting pricing or reducing costs.':
    '{orders} orders par {price} har ek, aap ki campaign {adSpend} ad kharchay ke baad {profit} nuqsan karti hai. Qeemat ya laagat mein tabdeeli par ghour karein.',
  'With 0 orders, there is no revenue or profit to calculate. Enter expected orders to see projections.':
    '0 orders par koi aamdani ya munafa calculate nahi ho sakta. Peshangoi dekhne ke liye mutawaqqa orders darj karein.',
  'Results are estimates based on your provided assumptions. Actual results may vary.':
    'Nataij aap ki faraham karda farziyaat par mabni andazay hain. Haqiqi nataij mukhtalif ho sakte hain.',
  'Analysis Name': 'Tajziye Ka Naam',
  'e.g. Skincare Serum - March Launch': 'misalan Skincare Serum - March Launch',
  'Reset to Demo Values': 'Demo Values Par Reset Karein',
  'This will replace all current values with the demo product values (Premium Skincare Serum). Any changes you have made will be lost.':
    'Yeh tamam mojooda values ko demo product values (Premium Skincare Serum) se tabdeel kar dega. Aap ki koi bhi tabdeeli zaya ho jaye gi.',
  'Clear All Fields': 'Tamam Fields Saaf Karein',
  'This will zero out all fields except the delivery success rate (which will remain at 75%). Any changes you have made will be lost.':
    'Yeh delivery success rate (jo 75% rahe gi) ke ilawa tamam fields ko sifar kar dega. Aap ki koi bhi tabdeeli zaya ho jaye gi.',

  // ── COD Calculator Page ───────────────────────────────────────────────────
  'Compare courier costs, COD fees, and break-even ROAS across Pakistani couriers':
    'Pakistani couriers mein courier kharchay, COD fees aur break-even ROAS ka muqabla karein',
  'Hide Rate Editor': 'Rate Editor Chupayein',
  'Edit Rates': 'Rates Tarmeem Karein',
  'Rate Configuration': 'Rate Tarteeb',
  'Reset to Defaults': 'Defaults Par Reset Karein',
  'Shipment Parameters': 'Shipment Parameters',
  'Order value (PKR)': 'Order Ki Qeemat (PKR)',
  'Delivery success rate (%)': 'Delivery Kamyabi Ki Sharah (%)',
  'RTO shipping cost (PKR)': 'RTO Shipping Kharcha (PKR)',
  'Ad budget (PKR)': 'Ishtihari Budget (PKR)',
  'Cost Comparison': 'Kharchay Ka Muqabla',
  'Break-even ROAS by Origin City': 'Origin Shehar Ke Hisaab Se Break-Even ROAS',
  'Origin City': 'Origin Shehar',
  'Destination': 'Manzil',
  'Delivery Cost by Destination City': 'Manzil Shehar Ke Hisaab Se Delivery Kharcha',
  'Delivery cost': 'Delivery Kharcha',
  'COD fee': 'COD Fais',
  'COD Fee': 'COD Fais',
  'Expected RTO cost/order': 'Mutawaqqa RTO Kharcha/Order',
  'Total cost/placed order': 'Kul Kharcha/Placed Order',
  'Expected contribution/order': 'Mutawaqqa Hissa/Order',
  'Settlement period': 'Settlement Muddat',
  'Selected': 'Muntakhab',
  'Delivery': 'Delivery',
  'Exp. RTO': 'Mutawaqqa RTO',
  'Total/order': 'Kul/Order',
  'Contribution': 'Hissa',
  'BE ROAS': 'BE ROAS',
  'Settlement': 'Adaayegi',

  // ── Break-Even ROAS by City Section ────────────────────────────────────────
  'Break-Even ROAS by City': 'Shehar Ke Hisaab Se Break-Even ROAS',
  'Using current product': 'Mojooda product istemal ho raha hai',
  'Using order value': 'Order ki qeemat istemal ho rahi hai',
  'delivery': 'delivery',
  'Break-Even ROAS by City note':
    'Rates isharaati hain (tehqeeq Nov 2026). Har shehar ke liye delivery kamyabi ki sharah mukhtalif farz ki gayi hai. Break-even ROAS = (Delivery Rate × Selling Price) / Mutawaqqa Hissa per Placed Order. Apne courier rate card ke mutabiq rates tarmeem karein.',

  // ── Scenarios Page ────────────────────────────────────────────────────────
  'Scenario Comparison': 'Manzar Nama Muqabla',
  'Compare different launch scenarios using hypothetical assumptions.':
    'Farzi farziyaat istemal karke mukhtalif launch manzar namon ka muqabla karein.',
  'Reset Scenarios': 'Manzar Namay Reset Karein',
  'Save Scenarios': 'Manzar Namay Save Karein',
  'Export Scenarios': 'Manzar Namay Export Karein',
  'Scenario Name': 'Manzar Nama Ka Naam',
  'Side-by-Side Comparison': 'Pehlu Ba Pehlu Muqabla',
  'Metric': 'Metric',
  'Visual Comparison': 'Basyri Muqabla',
  'Courier Cost by Scenario': 'Manzar Nama Ke Hisaab Se Courier Kharcha',

  // ── Readiness Checklist Page ──────────────────────────────────────────────
  'Launch Readiness Checklist': 'Launch Tayyari Ki Checklist',
  "Ensure you've covered all the bases before launching your product.":
    'Apni product launch karne se pehle tamam bunyadi baatein yaqeeni banayein.',
  'Auto': 'Khudkaar',
  'Auto-detected from your data': 'Aap ke data se khud ba khud pehchana gaya',
  'This will reset all manual overrides and custom tasks. Auto-detected tasks will be restored based on your current data. This action cannot be undone.':
    'Yeh tamam manual overrides aur custom tasks ko reset kar dega. Khudkaar pehchanay gaye tasks aap ke mojooda data ki bunyad par bahal ho jayenge. Yeh amal wapis nahi ho sakta.',

  // ── AI Insights Page ──────────────────────────────────────────────────────
  'Your AI Launch Advisor': 'Aap Ka AI Launch Mashir',
  'Turn your product numbers into a smarter launch strategy.':
    'Apni product ke adad ko hoshiyar launch hikmat-e-amli mein tabdeel karein.',
  'Ask LaunchLens — Your Business Growth Advisor':
    'LaunchLens Se Poochein — Aapke Karobar Ki Taraqqi Ka Mashir',
  'Have specific questions about your product, profit margins, advertising strategy, or growth plans? Chat with LaunchLens for personalized, actionable advice based on your simulation data.':
    'Apke product, munafay ke margins, advertising strategy ya taraqqi ke plans ke baare mein koi sawaal hai? LaunchLens se baat karein aur apne simulation data par mabni shakhsi, amal ke qabil mashware hasil karein.',

  // ── Product Discovery Page ────────────────────────────────────────────────
  'TrendScout AI — Product Discovery': 'TrendScout AI — Product Ki Talash',
  'Discover profitable product opportunities using AI-powered market research.':
    'AI se chalne wali market tehqeeq ke zariye munafa awar product ke mauqay daryaft karein.',
  'Discover Products': 'Products Daryaft Karein',
  'Ask TrendScout': 'TrendScout Se Poochein',

  // ── Contact Page ──────────────────────────────────────────────────────────
  'Contact Us': 'Hum Se Rabta Karein',

  // ── About Page ────────────────────────────────────────────────────────────
  'Built for e-commerce sellers who want to launch with confidence.':
    'Un e-commerce sellers ke liye jo pur-aitmaad launch karna chahte hain.',

  // ── Features Page ─────────────────────────────────────────────────────────
  'Powerful tools to help you make smarter launch decisions.':
    'Zabardast tools jo aap ko behtar launch faislay karne mein madad kartay hain.',

  // ── Launch Decision Engine Page ───────────────────────────────────────────
  'Launch Decision Engine': 'Launch Faisla Engine',
  'Know your numbers before you spend your money.':
    'Apna paisa kharch karne se pehle apne adad janain.',
  'Explore Demo': 'Demo Dekhein',
  'Sample data pre-filled. Edit any value and recalculate to see updated results.':
    'Namoona data pehle se darj hai. Koi bhi qeemat tabdeel karein aur naye nataij dekhne ke liye dobara calculate karein.',
  'Try Now': 'Abhi Azmayein',
  'Track Actuals': 'Haqiqi Nataij Track Karein',
  'Print Report': 'Report Print Karein',
  'Report exports require Standard or Business plan with confirmed payment':
    'Report export ke liye Standard ya Business plan aur tasdeeq shuda payment zaroori hai',
  'No saved analyses yet. Fill in the form and save your first analysis.':
    'Abhi tak koi tajziya mehfooz nahi. Form pur karein aur apna pehla tajziya save karein.',
  'Product & Cost Inputs': 'Product Aur Laagat Inputs',
  'e.g. Wireless Earbuds Pro': 'misalan Wireless Earbuds Pro',
  'Product Purchase Cost': 'Product Khareedari Ki Laagat',
  'Cost for successful deliveries': 'Kamyab deliveries ka kharcha',
  'Packaging & Other Costs': 'Packaging Aur Deegar Kharchay',
  'COD Delivery Success Rate': 'COD Delivery Kamyabi Ki Sharah',
  'success': 'kamyabi',
  'Cost when order is returned': 'Jab order wapis ho jaye to kharcha',
  'Non-Recoverable Loss': 'Ghair Qabil-e-Wapsi Nuqsan',
  'Product value lost per failed delivery (optional)':
    'Har nakam delivery par zaya hone wali product qeemat (ikhtiyari)',
  'Launch Decision Report': 'Launch Faisla Report',
  'Generated on': 'Tareekh-e-ijra',
  'Financial Summary': 'Mali Khulasa',
  'Hide Formulas': 'Formulas Chupayein',
  'How These Numbers Were Calculated': 'Yeh Adad Kaise Calculate Huay',
  'Unit Economics': 'Unit Economics',
  'Contribution per Delivered Order': 'Har Delivered Order Par Hissa',
  'Before advertising costs': 'Ishtihari kharchon se pehle',
  'Expected Contribution per Placed Order': 'Har Placed Order Par Mutawaqqa Hissa',
  'After accounting for RTO losses': 'RTO nuqsanat ko shamil karne ke baad',
  'Break-Even Analysis': 'Break-Even Tajziya',
  'Break-Even CPA': 'Break-Even CPA',
  'Maximum cost per acquisition': 'Zyada se zyada har acquisition ka kharcha',
  'Break-Even Orders': 'Break-Even Orders',
  'To recover ad budget': 'Ad budget wapis paane ke liye',
  'Profit Projection': 'Munafa Peshangoi',
  'Profit at': 'Munafa bar',
  'Moderate scale projection': 'Mutawassit paimanay ki peshangoi',
  'Estimated at scale': 'Baray paimanay par mutawaqqa',
  'Contribution per delivered order': 'Har delivered order par hissa',
  'Packaging': 'Packaging',
  'Expected contribution per placed order': 'Har placed order par mutawaqqa hissa',
  'Contribution per delivered': 'Har delivered par hissa',
  'Break-even orders': 'Break-even orders',
  'Profit at volume V': 'Volume V par munafa',
  'Note: Returned inventory is treated as recoverable unless non-recoverable loss is specified.':
    'Note: Wapis inventory ko qabil-e-wapsi samjha jata hai jab tak ghair qabil-e-wapsi nuqsan makhsoos na ho.',
  'Costs are not double-counted on returned orders. Break-even ROAS accounts for delivery success rate — only revenue from successfully delivered orders counts toward ad spend recovery.':
    'Wapis orders par kharchay do baar nahi ginay jatay. Break-Even ROAS delivery kamyabi ki sharah ko mad-e-nazar rakhta hai — sirf kamyab delivered orders ki aamdani ad spend ki wapsi mein shumar hoti hai.',
  'Courier Cost Analysis': 'Courier Kharcha Tajziya',
  'Side-by-side comparison using current product parameters. Indicative rates, researched Nov 2026.':
    'Mojooda product parameters ke mutabiq pehlu ba pehlu muqabla. Isharaati rates, tehqeeq Nov 2026.',
  'Launch Recommendation': 'Launch Sifarish',
  'Verdict': 'Faisla',
  'Financial assumptions support launching': 'Mali farziyaat launch ki himayat karti hain',
  'More validation or controlled testing recommended': 'Mazeed jaanch ya mehsoos test ki sifarish',
  'Current economics indicate high risk': 'Mojooda economics ziyada khatra zahir karte hain',
  'Key Reasoning:': 'Bunyadi Wajohaat:',
  'Compare three budget scenarios side by side. Adjust inputs to see how different assumptions affect profitability.':
    'Teen budget manzar namon ka pehlu ba pehlu muqabla karein. Munafa awarzi par mukhtalif farziyaat ka asar dekhne ke liye inputs tabdeel karein.',
  'Delivered': 'Delivered',
  'Est. Profit': 'Mutawaqqa Munafa',
  'Estimate only': 'Sirf andaza',
  'Prediction vs Actual Tracker': 'Peshangoi Ba Muqabla Haqiqat Tracker',
  'Add Result': 'Nateeja Shamil Karein',
  'Record Campaign Results': 'Campaign Nataij Darj Karein',
  'Actual Ad Spend': 'Haqiqi Ad Kharcha',
  'Orders Placed': 'Placed Orders',
  'Delivered Orders': 'Delivered Orders',
  'RTO Orders': 'RTO Orders',
  'Actual Revenue': 'Haqiqi Aamdani',
  'Additional Expenses': 'Izafi Kharchay',
  'Save Result': 'Nateeja Save Karein',
  'Predicted Profit': 'Peshangoi Munafa',
  'Actual Profit': 'Haqiqi Munafa',
  'Difference': 'Farq',
  'Key Variance Sources:': 'Bunyadi Farqiyat Wajohaat:',
  'Suggestions for Next Campaign:': 'Agli Campaign Ke Liye Mashwarey:',
  'No actual campaign results recorded yet. Click "Add Result" to track your real campaign performance against predictions.':
    'Abhi tak koi haqiqi campaign nateeja darj nahi. Apni haqiqi campaign ki karkardagi ko peshangoi se muqabla karne ke liye "Nateeja Shamil Karein" par click karein.',
  'e.g. Wireless Earbuds - March Launch': 'misalan Wireless Earbuds - March Launch',
  'Saved': 'Mehfooz',

  // ── FAQ Questions & Answers ───────────────────────────────────────────────
  'What is LaunchLens AI and how does it work?':
    'LaunchLens AI kya hai aur yeh kaise kaam karta hai?',
  'LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs evaluate product viability before investing in advertising. It analyzes your unit economics, delivery risks, and market conditions to provide data-driven launch recommendations.':
    'LaunchLens AI ek product launch intelligence platform hai jo e-commerce karobariyon ko ads mein sarmaya lagane se pehle product ki feasibility jaanchne mein madad karta hai. Yeh aap ki unit economics, delivery ke khatraat aur market ki surat-e-haal ka tajziya karke data par mabni launch sifarishaat faraham karta hai.',
  'How does the Product Launch Decision Engine analyze my product?':
    'Product Launch Decision Engine meri product ka tajziya kaise karta hai?',
  'The Decision Engine evaluates multiple factors including your profit margins, competitive landscape, delivery success rates, and return risk. It combines these metrics into a comprehensive readiness score that tells you whether to launch, test further, or reconsider.':
    'Decision Engine aap ke munafa margins, muqabla ki surat-e-haal, delivery kamyabi ki sharah aur return risk jese kai pahluon ka jaiza leta hai. Yeh in sab metrics ko mila kar ek mukammal tayyari score banata hai jo batata hai ke launch karein, mazeed test karein ya dobara ghour karein.',
  'What is COD profitability and why does it matter?':
    'COD munafa awarzi kya hai aur yeh kyun ahem hai?',
  'COD (Cash on Delivery) profitability accounts for the unique risks of cash-on-delivery markets where return rates and delivery failures directly impact your bottom line. Understanding true COD profitability prevents costly surprises from rejected deliveries and returns.':
    'COD (Cash on Delivery) munafa awarzi un khusoosi khatraat ko shamil karti hai jo COD markets mein hotay hain jahan return rates aur delivery ki nakami seedha aap ke munafa par asar daalti hai. Haqiqi COD munafa awarzi ko samajhna rejections aur returns se hone walay mehngay nuqsanat se bachata hai.',
  'How are break-even CPA and ROAS calculated?':
    'Break-Even CPA aur ROAS kaise calculate hotay hain?',
  'Break-Even ROAS = (Delivery Rate × Selling Price) / Expected Contribution per Placed Order. Break-Even CPA = Expected Contribution per Placed Order. The delivery rate appears in the ROAS formula because it determines how many placed orders actually result in delivered, paid orders — a lower delivery rate means fewer completed sales for the same ad spend, raising the minimum ROAS needed to break even.':
    'Break-Even ROAS = (Delivery Rate × Selling Price) / Har Placed Order Par Mutawaqqa Hissa. Break-Even CPA = Har Placed Order Par Mutawaqqa Hissa. Delivery rate ROAS formula mein is liye aati hai kyunke yeh tay karti hai ke kitnay placed orders waqai deliver aur pay hotay hain — kam delivery rate ka matlab hai ke usi ad spend par kam bikri, jis se break-even ke liye zaroori kam az kam ROAS barh jata hai.',
  'Is my data secure and private?':
    'Kya mera data mehfooz aur zaati hai?',
  'Yes, all data is processed securely and stored with industry-standard encryption. We never share your product information or business data with third parties. Your analysis results are visible only to your account.':
    'Jee haan, tamam data mehfooz tareeqay se process hota hai aur industry standard encryption ke saath store hota hai. Hum kabhi bhi aap ki product maloomat ya karobari data teesray faraq se share nahi karte. Aap ke tajziye ke nataij sirf aap ke account ko nazar aatay hain.',

  // ── Overview — About Section Long Descriptions ────────────────────────────
  'LaunchLens AI is a product launch intelligence platform that helps e-commerce entrepreneurs evaluate product viability before investing in advertising. We combine unit economics analysis, delivery risk assessment, and market intelligence to provide data-driven launch recommendations tailored for COD (Cash on Delivery) markets.':
    'LaunchLens AI ek product launch intelligence platform hai jo e-commerce karobariyon ko ads mein sarmaya lagane se pehle product ki feasibility jaanchne mein madad karta hai. Hum unit economics tajziya, delivery risk jaiza aur market intelligence ko mila kar COD (Cash on Delivery) markets ke liye khaas data par mabni launch sifarishaat faraham karte hain.',
  'Designed for Amazon sellers, Shopify store owners, and independent e-commerce businesses operating in markets with high COD adoption — especially Pakistan, South Asia, Middle East, and Latin America. Whether you are launching your first product or scaling an existing catalog, LaunchLens AI gives you the financial clarity to make confident decisions.':
    'Amazon sellers, Shopify store maalikoon aur azad e-commerce karobaron ke liye jo ziyada COD istemal honay wali markets mein kaam karte hain — khaas tor par Pakistan, South Asia, Middle East aur Latin America. Chahe aap apni pehli product launch kar rahe hon ya mojooda catalog barha rahe hon, LaunchLens AI aap ko pur-aitmaad faislay karne ke liye mali wazahat deta hai.',
  'We believe every e-commerce entrepreneur deserves access to the same level of financial analysis that large brands use. LaunchLens AI democratizes product launch intelligence, helping sellers avoid costly mistakes and focus their resources on products with the highest probability of success.':
    'Humara yaqeen hai ke har e-commerce karobari ko usi mayaar ka financial tajziya milna chahiye jo baray brands istemal karte hain. LaunchLens AI product launch intelligence ko aam banata hai, sellers ko mehngi ghaltiyon se bachata hai aur un ke wasail ko un products par markooz karta hai jin mein kamyabi ka sab se ziyada imkaan ho.',

  // ── Overview — Authenticated Dashboard ────────────────────────────────────
  'Current Product': 'Mojooda Product',
  'View Checklist': 'Checklist Dekhein',
  'No saved analyses yet': 'Abhi tak koi tajziya mehfooz nahi',
  'Run your first simulation and save it to see recent analyses here.':
    'Apna pehla simulation chalayein aur save karein taake haaliya tajziye yahan nazar aayen.',
  'Run Your First Simulation': 'Pehla Simulation Chalayein',
  "All tasks complete — you're ready to launch!":
    'Tamam tasks mukammal — aap launch ke liye tayyar hain!',
  '% of launch readiness tasks completed.':
    '% launch tayyari tasks mukammal ho gaye.',

  // ── Overview — Courier Rates at a Glance ──────────────────────────────────
  'Courier Rates at a Glance': 'Courier Rates Ek Nazar Mein',
  'View full comparison': 'Mukammal muqabla dekhein',
  'Base (1kg)': 'Bunyaad (1kg)',
  'Indicative rates, researched Nov 2026. Use the COD/RTO Calculator for detailed comparisons.':
    'Isharaati rates, tehqeeq Nov 2026. Tafseeli muqablay ke liye COD/RTO Calculator istemal karein.',

  // ── Pricing Plan Features ─────────────────────────────────────────────────
  'Basic AI access': 'Bunyadi AI rasai',
  'Limited research': 'Mahdood tehqeeq',
  'Limited projects': 'Mahdood projects',
  'Basic reports': 'Bunyadi reports',
  'Advanced AI access': 'Paisheeda AI rasai',
  'More research capabilities': 'Ziyada tehqeeqi salahiyatein',
  'Increased project limits': 'Barhay huay project limits',
  'Detailed analysis': 'Tafseeli tajziya',
  'Report exports': 'Report exports',
  'Advanced AI capabilities': 'Paisheeda AI salahiyatein',
  'Higher usage limits': 'Baland istemal limits',
  'All premium features': 'Tamam premium khusoosiyat',
  'Team collaboration': 'Team taawun',
  'Advanced analytics': 'Paisheeda analytics',

  // ── Launch Simulator — Additional ─────────────────────────────────────────
  'Export Report PRO': 'Report Export PRO',
  'success,': 'kamyabi,',
  'RTO': 'RTO',

  // ── Exchange Rate Source ───────────────────────────────────────────────
  'Indicative manual rate': 'Isharaati manual rate',
  'This rate is indicative only and may differ from actual bank or market rates.':
    'Yeh rate sirf isharaati hai aur haqiqi bank ya market rates se mukhtalif ho sakta hai.',

  // ── Copy & Export Actions ───────────────────────────────────────────────
  'Copy Advice': 'Mashwara Copy Karein',
  'Copied!': 'Copy ho gaya!',
  'Export Advice': 'Mashwara Export Karein',
  'Copy': 'Copy',
  'Copy Response': 'Jawab Copy Karein',

  // ── Profit Tracker ────────────────────────────────────────────────────────
  'Log Actual Results': 'Haqiqi Nataij Darj Karein',
  'Profit Tracker': 'Munafa Tracker',
  'Orders Delivered': 'Delivered Orders',
  'Orders Returned': 'Wapis Orders',
  'Revenue Received': 'Haasil Aamdani',
  'Ad Spend': 'Ad Kharcha',
  'Delivery Cost Paid': 'Delivery Kharcha Ada Kiya',
  'Predicted': 'Peshangoi',
  'Actual': 'Haqiqi',
  'Variance': 'Farq',
  'Total Predicted Profit': 'Kul Peshangoi Munafa',
  'Total Actual Profit': 'Kul Haqiqi Munafa',
  'Total Variance': 'Kul Farq',
  'Date Logged': 'Tareekh-e-Andraj',
  'Delete this actual entry? This cannot be undone.':
    'Is haqiqi entry ko delete karein? Yeh wapis nahi ho sakta.',
  'Confirm': 'Tasdeeq',
  'No tracked results yet': 'Abhi tak koi track shuda nateeja nahi',
  'Log actual results for your saved analyses to compare predicted vs actual performance.':
    'Apne mehfooz tajziyon ke liye haqiqi nataij darj karein taake peshangoi aur haqiqat ka muqabla kar sakein.',
  'Log Actual': 'Haqiqi Darj Karein',

  // ── CSV Import ────────────────────────────────────────────────────────────
  'Import Orders': 'Orders Import Karein',
  'File Upload': 'File Upload',
  'Paste CSV': 'CSV Paste Karein',
  'Download CSV Template': 'CSV Template Download Karein',
  'Drag & drop a .csv file here, or click to browse':
    '.csv file yahan drag & drop karein, ya browse karne ke liye click karein',
  'Paste your CSV data below:': 'Apna CSV data neeche paste karein:',
  'Parse CSV': 'CSV Parse Karein',
  'Import Summary': 'Import Khulasa',
  'Total Rows': 'Kul Rows',
  'Date Range': 'Tareekh Ki Range',
  'Returned': 'Wapis',
  'Import into Tracker': 'Tracker Mein Import Karein',
  'Missing required columns': 'Zaroori columns ghayab hain',
  'Required columns': 'Zaroori columns',
  'No valid rows found in CSV': 'CSV mein koi sahi row nahi mili',
  'CSV parsed successfully': 'CSV kamyabi se parse ho gayi',
  'rows': 'rows',
  'There is no live Daraz or Shopify API connection. Import reads the CSV file you manually export from those platforms.':
    'Koi live Daraz ya Shopify API connection nahi hai. Import sirf woh CSV file parhta hai jo aap un platforms se manual export karte hain.',
  'Export your orders from Daraz Seller Center (Orders → Export) or Shopify (Orders → Export all orders as CSV), then upload or paste the file here.':
    'Apne orders Daraz Seller Center (Orders → Export) ya Shopify (Orders → Export all orders as CSV) se export karein, phir file yahan upload ya paste karein.',
  'Predicted vs Actual (CSV Import)': 'Peshangoi Ba Muqabla Haqiqat (CSV Import)',
  'Select an analysis to compare against:': 'Muqablay ke liye ek tajziya chunein:',
  'No saved analyses available for comparison.':
    'Muqablay ke liye koi mehfooz tajziya dastyaab nahi.',
  'Comparison Metrics': 'Muqabla Metrics',

  // ── My Products Page ────────────────────────────────────────────────────────
  'My Products': 'Meri Products',
  'Manage your products — switch, rename, duplicate, or delete.':
    'Apni products manage karein — switch, rename, duplicate ya delete karein.',
  'Switch': 'Switch Karein',
  'Rename': 'Naam Tabdeel Karein',
  'Duplicate': 'Duplicate Karein',
  'Add Product': 'Product Shamil Karein',
  'Current': 'Mojooda',
  'Set as Current': 'Mojooda Banayein',
  'Enter new name': 'Naya naam likhein',
  'Delete Product': 'Product Delete Karein',
  'Are you sure you want to delete this product? This action cannot be undone.':
    'Kya aap waqai is product ko delete karna chahte hain? Yeh amal wapis nahi ho sakta.',
  'You cannot delete the last remaining product.':
    'Aap aakhri bachi hui product ko delete nahi kar sakte.',
  'No products yet': 'Abhi tak koi product nahi',
  'Add your first product to get started with simulations and analysis.':
    'Simulations aur tajziya shuru karne ke liye apni pehli product shamil karein.',
  'Go to Simulator': 'Simulator Par Jayein',

  // ── Courier Rate Sync (M8) ───────────────────────────────────────────────
  'Sync Rates': 'Rates Sync Karein',
  'Last synced:': 'Aakhri sync:',
  'Never synced': 'Kabhi sync nahi hua',
  'Indicative rates — not a live courier feed. Verify with your courier.':
    'Isharaati rates — live courier feed nahi. Apne courier se tasdeeq karein.',
  'Rates customized since last sync':
    'Aakhri sync ke baad rates tarmeem kiye gaye',
  'Rates synced to defaults': 'Rates defaults par sync ho gaye',

  // ── Team Collaboration ───────────────────────────────────────────────────
  'Team': 'Team',
  'Team Collaboration': 'Team Taawun',
  'Manage your team members and their access levels.':
    'Apni team ke arkaan aur un ke rasai ki satah manage karein.',
  'Invite Member': 'Member Mad-oo Karein',
  'Member Name': 'Member Ka Naam',
  'Role': 'Kirdaar',
  'Status': 'Haalat',
  'Admin': 'Admin',
  'Editor': 'Editor',
  'Viewer': 'Dekhne Wala',
  'Invited': 'Mad-oo Shuda',
  'Owner': 'Maalik',
  'Remove': 'Hataein',
  'Change Role': 'Kirdaar Tabdeel Karein',
  'No members invited yet': 'Abhi tak koi member mad-oo nahi hua',
  'Invite team members to collaborate on your product launches.':
    'Apni product launches mein taawun ke liye team members ko mad-oo karein.',
  'Name is required': 'Naam zaroori hai',
  'Valid email is required': 'Sahih email zaroori hai',
  'In-app invite only — no email sent':
    'Sirf in-app invite — koi email nahi bheja gaya',
  'Remove Member': 'Member Hataein',
  'Are you sure you want to remove this member from your team? This action cannot be undone.':
    'Kya aap waqai is member ko apni team se hatana chahte hain? Yeh amal wapis nahi ho sakta.',
  'Team collaboration Business plan mein hai — upgrade karein':
    'Team collaboration Business plan mein hai — upgrade karein',
  'Upgrade to Business Plan': 'Business Plan Par Upgrade Karein',
  'This feature requires the Business plan. Upgrade now to unlock team collaboration, advanced analytics, and higher usage limits.':
    'Yeh khusoosiyat Business plan mein dastyaab hai. Team taawun, paisheeda analytics aur barhay istemal limits unlock karne ke liye abhi upgrade karein.',

  // ── Notifications ───────────────────────────────────────────────────────
  'Notifications': 'Notifications',
  'Mark all read': 'Sab parh liya',
  'Mark as read': 'Parh liya',
  'No notifications yet': 'Abhi koi notification nahi',
  'Courier rates updated': 'Courier rates update ho gaye',
  'Analysis saved': 'Analysis save ho gayi',
  'Launch readiness X%': 'Launch tayyari {pct}% ho gayi',
  'Just now': 'Abhi abhi',
  'minutes ago': 'minute pehle',
  'hours ago': 'ghantay pehle',
  'days ago': 'din pehle',
};

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Returns a `t(key)` translation function bound to the current language.
 * If no translation exists for the key, the key itself is returned (English fallback).
 */
export function useTranslation() {
  const language: Language = useAppSelector((state) => state.ui.language);

  const t = useCallback(
    (key: string): string => {
      if (language === 'ur') {
        return translations[key] ?? key;
      }
      return key;
    },
    [language],
  );

  return { t, language };
}
