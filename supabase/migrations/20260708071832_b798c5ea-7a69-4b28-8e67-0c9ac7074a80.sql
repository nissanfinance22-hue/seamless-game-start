-- Colunas novas (compatíveis com o schema atual)
ALTER TABLE public.market_listings
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS buyer_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Índices
CREATE INDEX IF NOT EXISTS market_listings_active_idx
  ON public.market_listings (created_at DESC)
  WHERE sold_at IS NULL;
CREATE INDEX IF NOT EXISTS market_listings_seller_idx
  ON public.market_listings (seller_id);

-- GRANTs (Data API)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_listings TO authenticated;
GRANT ALL ON public.market_listings TO service_role;

-- Políticas (idempotentes)
DROP POLICY IF EXISTS "Anyone authenticated can view listings" ON public.market_listings;
CREATE POLICY "Anyone authenticated can view listings"
  ON public.market_listings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Seller can create own listing" ON public.market_listings;
CREATE POLICY "Seller can create own listing"
  ON public.market_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = seller_id AND sold_at IS NULL AND buyer_id IS NULL);

DROP POLICY IF EXISTS "Seller can cancel own unsold listing" ON public.market_listings;
CREATE POLICY "Seller can cancel own unsold listing"
  ON public.market_listings FOR DELETE
  TO authenticated
  USING (auth.uid()::text = seller_id AND sold_at IS NULL);

DROP POLICY IF EXISTS "Any authenticated user can buy an active listing" ON public.market_listings;
CREATE POLICY "Any authenticated user can buy an active listing"
  ON public.market_listings FOR UPDATE
  TO authenticated
  USING (sold_at IS NULL AND auth.uid()::text <> seller_id)
  WITH CHECK (buyer_id = auth.uid()::text AND sold_at IS NOT NULL);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_market_listings_updated_at ON public.market_listings;
CREATE TRIGGER update_market_listings_updated_at
BEFORE UPDATE ON public.market_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();