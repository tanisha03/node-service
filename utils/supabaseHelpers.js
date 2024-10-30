const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getAllOffers = async () => {
  return await supabase.from('offers').select();
};

const incrementField = async (offerId, field) => {
  const { data: currentData, error: fetchError } = await supabase
    .from('offers')
    .select(field)
    .eq('id', offerId)
    .single();

  if (fetchError) {
    return { error: fetchError };
  }

  // Increment the field value
  const currentValue = currentData[field];
  const newValue = currentValue + 1;

  // Update the field with the new value
  return await supabase
    .from('offers')
    .update({ [field]: newValue })
    .eq('id', offerId);

};

module.exports = { getAllOffers, incrementField };
