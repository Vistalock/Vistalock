-- Find Andy Technologies application
SELECT id, "businessName", status, email 
FROM "MerchantApplication" 
WHERE "businessName" ILIKE '%andy%';

-- Delete the application (uncomment and run after verifying above)
-- DELETE FROM "MerchantApplication" WHERE "businessName" ILIKE '%andy%';
