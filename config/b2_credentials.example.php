<?php
// Backblaze B2 & Cloudflare CDN Configuration Template
// Copy to b2_credentials.php and fill in your production values

return [
    'key_id'          => 'YOUR_BACKBLAZE_KEY_ID',
    'application_key' => 'YOUR_BACKBLAZE_APPLICATION_KEY',
    'bucket_id'       => 'YOUR_BACKBLAZE_BUCKET_ID',
    'bucket_name'     => 'SambaBrasil',
    'region'          => 'us-west-004',
    'endpoint'        => 's3.us-west-004.backblazeb2.com',
    'cdn_base_url'    => 'https://cdn.sambabrasilchannel.com.ar',
    
    // Supabase config
    'supabase_url'      => 'https://tgiysffinqhwpyuebmon.supabase.co',
    'supabase_anon_key' => 'YOUR_SUPABASE_ANON_KEY',
];
