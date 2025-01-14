const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const getAllOffers = async () => {
  return await supabase.from('offers').select();
};

const getLeadDetails = async (id) => {
  return await supabase.from('leads').select().eq('id', leadId);
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

const addActivity = async (leadId, value) => {
  const { data, error } = await supabase
    .from('leads')
    .select()
    .eq('id', leadId)

  if (error) {
    return { error };
  }

  // Increment the field value
  const currentValue = data && data[0]?.activity && JSON.parse(data[0].activity)?.data;
  var newValue = [
    ...currentValue || [],
    value
  ];

  // Update the field with the new value
  return await supabase
    .from('leads')
    .update({ activity: JSON.stringify({data: newValue}) })
    .eq('id', leadId);

};

module.exports = { getAllOffers, incrementField, addActivity };
