select e.status, e.amount, e.created_at, r.request_no, r.status as job_status
from extra_charges e join requests r on r.id = e.request_id
order by e.created_at desc limit 5;
