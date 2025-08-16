# SCALING.md

**Amrutam Ayurvedic Consultation Platform – Scaling Strategy**

## Goal

Design the system to support **5,000 appointments/day across 1,000 doctors** while maintaining fast response times, reliability, and extendibility.

---

## 1. Architecture Overview

### Current Stack

* Frontend: React / Next.js
* Backend: Node.js + Express
* Database: PostgreSQL / MongoDB
* Auth: JWT
* Redis: Temporary slot locks


* **Load Balancer**: Distributes requests across multiple API instances. Supports horizontal scaling.
* **API Servers**: Stateless; can be replicated across nodes.
* **DB Cluster**: Sharding or read replicas to handle high read/write throughput.
* **Redis Cluster**: Handles slot locks, caching frequently accessed doctor data, and temporary OTP/session storage.
* **Message Queue**: Async operations like OTP emails, push notifications, or analytics.

---

## 2. Database Design Considerations

### Doctor Table

* Indexed on `specialization`, `location`, `availability`
* Optional caching in Redis for frequent queries

### Appointment Table

* Indexed on `doctor_id` + `appointment_time`
* Use **unique constraints** to prevent double bookings
* Partitioning by date for fast queries over large data

### Slot Lock

* Redis: key = `doctor:{id}:slot:{timestamp}`
* TTL = 5 min
* Ensures atomicity using `SETNX` to prevent race conditions

### Scaling DB

* **Reads**: Read replicas for fetching doctor lists, availability
* **Writes**: Master for booking/rescheduling
* **Partitioning**: Monthly or weekly appointment partitions to reduce table size

---

## 3. API Scaling

* **Rate Limiting**: Redis-based per user to avoid abuse
* **Caching**: Doctor search results cached for 5–10 min
* **Pagination**: For doctor lists and appointment history
* **Bulk Fetch**: Batch queries for recurring availability
* **Async Tasks**: OTP sending and notifications via message queue

---

## 4. Slot Booking Flow (High Load)

1. User requests available slots → API fetches from DB or cache.
2. User selects a slot → Redis lock set (`SETNX`).
3. OTP verification (optional) → Confirmation triggers DB write.
4. Slot released in Redis if TTL expires → becomes available again.

**Benefits**: Avoids DB contention for high-frequency slots, scales horizontally.

---

## 5. Scaling Frontend

* Use **SSR/SSG in Next.js** for static doctor pages
* Lazy-load calendar and availability data
* WebSockets or polling for real-time slot updates

---

## 6. Horizontal Scaling

* API: Add more Node.js instances behind load balancer
* Redis: Clustered and partitioned
* DB: Sharding or read replicas
* Queue workers: Scale workers based on async task load

---

## 7. Monitoring & Alerting

* Track:

  * Slot lock collisions
  * DB latency & queries per second
  * API error rates
* Tools: Prometheus + Grafana, Sentry for exceptions

---

## 8. Optional Optimizations

* **Doctor Availability Microservice**: Separate service for heavy calendar queries
* **GraphQL Layer**: Fetch only required doctor/appointment fields
* **CDN for Assets**: Reduce load on API servers
* **Autoscaling**: Cloud instances scale based on queue length or CPU load

---

**Conclusion:**
This design supports **5,000 appointments/day across 1,000 doctors**, ensures fast responses, prevents double bookings, and can grow with increased load by scaling components horizontally and leveraging caching, partitioning, and async processing.
