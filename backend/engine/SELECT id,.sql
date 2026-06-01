SELECT id,
       portfolio_id,
       ticker,
       weight,
       beta,
       created_at
FROM public.portfolio_assets
LIMIT 1000;