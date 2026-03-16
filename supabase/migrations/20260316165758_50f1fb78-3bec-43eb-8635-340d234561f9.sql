
CREATE POLICY "Allow inserts on rate_limits" ON public.rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads on rate_limits" ON public.rate_limits FOR SELECT USING (true);
