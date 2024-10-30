const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getAllOffers = async () => {
  return await supabase.from('offers').select();
};

const incrementField = async (offerId, field) => {
  return await supabase
    .from('offers')
    .update({ [field]: supabase.raw(`"${field}" + 1`) })
    .eq('id', offerId);
};

module.exports = { getAllOffers, incrementField };
