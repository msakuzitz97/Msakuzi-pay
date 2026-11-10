MSAKUZI PREDICTION + ADMIN DASHBOARD

FILES
- index.html: existing customer payment/prediction page. Kept unchanged.
- admin.html: private admin payment dashboard.

DEPLOY
Upload both files to the SAME website root/folder.
Customer page: https://YOUR-DOMAIN/
Admin page: https://YOUR-DOMAIN/admin.html

SUPABASE
The dashboard expects these existing RPC functions:
- admin_list_payments()
- admin_set_payment_status(p_token uuid, p_status text)
It uses Supabase Auth and checks the Admin UID in the browser, while the RPC functions must also enforce that UID server-side.
Do NOT add a service_role key to either HTML file.
