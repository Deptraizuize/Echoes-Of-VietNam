-- Enable realtime for premium_requests so users see status changes instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_requests;

-- Enable realtime for profiles so premium status syncs
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;