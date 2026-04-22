-- Restringe insert/select público em rate_limits para fechar finding "WITH CHECK (true)"
DROP POLICY IF EXISTS "Allow inserts on rate_limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Allow reads on rate_limits" ON public.rate_limits;

-- Apenas service_role pode escrever/ler rate_limits (usado pelo backend Node/Edge)
CREATE POLICY "Service role manages rate_limits"
ON public.rate_limits
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');