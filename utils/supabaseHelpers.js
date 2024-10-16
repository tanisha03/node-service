const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getAllOffers = async () => {
  return await supabase.from('offers').select();
};

module.exports = { getAllOffers };
