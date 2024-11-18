import supabase from '../config/supabaseClient';

// Events API
export const eventApi = {
  // Get all events
  getAllEvents: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create event
  createEvent: async (eventData) => {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('unique_id', eventId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete event
  deleteEvent: async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('unique_id', eventId);
    
    if (error) throw error;
    return true;
  }
};

// Assets API
export const assetApi = {
  // Get all assets
  getAllAssets: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create asset
  createAsset: async (assetData) => {
    const { data, error } = await supabase
      .from('assets')
      .insert([assetData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update asset
  updateAsset: async (assetId, assetData) => {
    const { data, error } = await supabase
      .from('assets')
      .update(assetData)
      .eq('asset_id', assetId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete asset
  deleteAsset: async (assetId) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('asset_id', assetId);
    
    if (error) throw error;
    return true;
  }
};

// Event Assets API
export const eventAssetsApi = {
  // Get assets for an event
  getEventAssets: async (eventId) => {
    const { data, error } = await supabase
      .from('event_assets')
      .select(`
        *,
        assets:asset_id(*)
      `)
      .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
  },

  // Allocate assets to event
  allocateAssets: async (eventId, assets) => {
    const { data, error } = await supabase
      .from('event_assets')
      .insert(assets.map(asset => ({
        event_id: eventId,
        asset_id: asset.asset_id,
        quantity: asset.quantity
      })))
      .select();
    
    if (error) throw error;
    return data;
  }
}; 