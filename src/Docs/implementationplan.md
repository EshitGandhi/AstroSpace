# Consultation System Implementation Plan (Chat, Voice & Video using GetStream)

# Objective

Implement a complete real-time consultation system using **GetStream Chat** and **GetStream Video & Audio Calling**.

The system should support:

* Instant Chat (Chat Now)
* Scheduled Consultation (Chat, Voice & Video)
* Real-time Notifications
* Wallet Based Billing
* Minute Wise Deduction
* Automatic Session Termination
* Leaderboard
* Booking Management
* Consultation History
* Filters & Search

The implementation should integrate cleanly into the existing AstroSpace project without breaking existing functionality.

---

# Implementation Status (Updated Jun 2026)

## Completed

| Area | Status |
|------|--------|
| Routes | `/consult`, `/consult/session/[id]`, `/chat` → Chat Menu, legacy redirects |
| User flow | Browse → request → accept → session with wallet billing |
| Pandit flow | Online toggle, split tabs (Chat Now / Scheduled pending), accept/reject, mode-specific join |
| Billing | Per-minute deduction, lock release, typing-triggered chat start, call join start |
| GetStream | Chat + voice/video panels (requires `NEXT_PUBLIC_STREAM_API_KEY` + `STREAM_API_SECRET`) |
| Notifications | User + pandit notification bell, pending request alert banner |
| Filters | Expertise, language, mode, price, experience, Chat Now / Schedule Later chips |
| Admin | `/admin` panel with consultation oversight |
| Wallet | Razorpay recharge integration |

## Requires Configuration

* **Database:** Run `npx prisma db push` to apply schema (`joinExpiresAt`, `billingStartedAt`)
* **GetStream:** Set env keys for production chat/call
* **Cron:** Schedule `GET /api/cron/expire-consultations` with `CRON_SECRET` header (every 1–5 min)

## Key Flow Rules

1. **Chat Now expiry:** Pandit has 3 min to accept; after accept, 3 min join window
2. **Scheduled expiry:** 24 h before auto-expire if not accepted
3. **Billing start:** Chat = pandit first keystroke; Voice/Video = pandit joins call
4. **Balance check:** Minimum 1 minute at selected mode rate before request

---

# Technologies

* GetStream Chat SDK
* GetStream Video SDK
* WebSocket Events
* Existing Authentication
* Existing Wallet System
* Existing Notification System
* Existing Database

---

# Consultation Types

The platform supports three consultation types.

* Chat
* Voice Call
* Video Call

Each consultation type has its own pricing.

---

# Session Types

There are only two booking modes.

## 1. Chat Now

Instant consultation.

Requires Pandit to be Online.

If Pandit accepts within 3 minutes, consultation starts.

---

## 2. Schedule Later

User selects

* Date
* Time
* Consultation Type

Pandit has 24 hours to accept or reject.

---

# PANDIT FLOW

---

## Dashboard

Add an Availability Toggle.

```
Available
Unavailable
```

This value must persist in database.

Changing status should instantly update all users.

When Available

* Chat Now requests can be received.

When Unavailable

* Chat Now button becomes disabled for users.

Scheduled bookings remain available.

---

# Dashboard Notification

When a Chat Now request arrives,

Show notification on dashboard.

Example

John Sharma wants to chat.

Buttons

Accept
Reject

---

# Booking Menu

Booking page contains

Tabs

Upcoming

Pending Requests

Completed

Cancelled

---

# Pending Requests

Display

User Photo

User Name

Consultation Type

Description

Requested Time

Duration (if scheduled)

Buttons

Accept

Reject

Icons

✔ Accept

✖ Reject

---

# Scheduled Request Rules

Scheduled request remains pending for

24 Hours

If Pandit does not respond

Automatically Reject

Notify User

Refund if required

---

# Chat Now Request Rules

Request expires in

3 Minutes

Countdown visible.

If Pandit does not respond

Auto Cancel

Notify User.

---

# Accepting Request

When accepted

Status changes

Pending

↓

Accepted

The action buttons disappear.

Instead display

Open Chat

or

Join Voice

or

Join Video

depending upon booking type.

---

# Chat Session

Clicking Chat

Creates Stream Chat Channel.

Do not start billing immediately.

Billing starts ONLY when

Pandit sends first message.

Reason

Avoid charging before consultation begins.

---

# Voice Session

Create Stream Call.

Billing starts ONLY when

Pandit joins the call.

---

# Video Session

Create Stream Video Call.

Billing starts ONLY when

Pandit joins the meeting.

---

# During Session

Display

Session Timer

Remaining Wallet

Price Per Minute

Connection Status

End Session button

---

# Wallet Billing

Billing should happen every minute.

Example

Price

₹30/min

Wallet

₹140

Minute 1

Deduct ₹30

Wallet

₹110

Minute 2

Deduct ₹30

Wallet

₹80

Continue until wallet becomes insufficient.

---

# Low Balance

If wallet cannot pay for next minute

Automatically

End Session

Notify both users

Reason

Insufficient Wallet Balance

---

# Wallet Credit

After every successful deduction

Credit same amount to

Pandit's Wallet

Maintain transaction logs.

---

# After Session

Save

Start Time

End Time

Duration

Minutes

Amount Paid

Amount Received

Consultation Type

Messages Count

Call Recording Metadata (if available)

Status

Completed

---

# USER FLOW

---

# Consult Pandit Page

Display Leaderboard.

Ranking should be based on

Average Rating

Number of Reviews

Completed Consultations

---

# Filters

Users can filter using

Expertise

Language

Consultation Type

Price

Experience

Rating

Chat Now Available

Schedule Available

Online Status

---

# Search

Search by

Pandit Name

Expertise

---

# Pandit Profile

Display

Profile Picture

Name

Expertise

Languages

Experience

Bio

Rating

Reviews

Pricing

Chat

Voice

Video

Buttons

Chat Now

Schedule Consultation

---

# Chat Now

If Pandit is

Available

Open consultation type selector.

If Unavailable

Show Toast

"Pandit is currently unavailable for instant consultation."

---

# Schedule Consultation

Open popup.

User selects

Chat

Voice

Video

Date

Time

Description

Display

Price Per Minute

User Wallet Balance

Expected Cost

Platform Fee (if applicable)

Confirm Booking

---

# Balance Validation

Before creating session

Validate

Wallet Balance

Minimum required balance.

If insufficient

Show Toast

Insufficient wallet balance.

Please recharge to continue.

---

# Consultation Type Selector

Display three cards.

Chat

₹xx/min

Voice

₹xx/min

Video

₹xx/min

Highlight selected option.

---

# Start Consultation

After confirmation

Create Booking

Redirect user

Consultation Dashboard

---

# Consultation Dashboard

Display

Upcoming Sessions

Active Session

Completed Sessions

Cancelled Sessions

Missed Sessions

---

# Active Session

Show

Countdown Timer

Join Button

Session Type

Pandit Details

---

# Join Rules

User has

3 Minutes

to join.

If user fails

Session automatically ends.

Billing still applies according to platform policy.

Same rule applies to scheduled sessions.

---

# During Chat

Display

Messages

Typing

Read Status

Session Timer

Wallet Balance

End Session

---

# During Voice/Video

Display

Video

Mute

Camera

Speaker

Network Status

Timer

Wallet Balance

End Session

---

# Ending Session

Session can end by

User

Pandit

Low Balance

Network Timeout

Admin

When ended

Save

Duration

Wallet Transactions

Consultation Status

---

# GetStream Integration

---

## Chat

Create channel

```
consultation_{bookingId}
```

Members

User

Pandit

Enable

Typing

Read Receipts

File Upload

Image Upload

---

## Voice

Create Stream Call

```
voice_{bookingId}
```

---

## Video

Create Stream Video Call

```
video_{bookingId}
```

---

# Billing Rules

Chat

Starts on

First Pandit Message

Voice

Starts when Pandit joins

Video

Starts when Pandit joins

Deduction

Every 60 seconds

Wallet

↓

Pandit Wallet

---

# Notifications

Notify

Chat Request

Booking Accepted

Booking Rejected

Session Started

Session Reminder

Session Ended

Wallet Low

Wallet Empty

New Message

Incoming Call

Missed Session

---

# Database Models

## Consultation

* id
* bookingId
* userId
* panditId
* consultationType
* sessionType
* streamChannelId
* status
* startTime
* endTime
* duration
* amountCharged
* amountPaid
* billingStartedAt

---

## Booking

* id
* userId
* panditId
* consultationType
* scheduleTime
* description
* status

---

## WalletTransaction

* id
* userId
* consultationId
* amount
* transactionType
* timestamp

---

## Notification

* id
* userId
* title
* message
* type
* isRead

---

# Session States

Requested

↓

Accepted

↓

Waiting To Join

↓

Joined

↓

Billing Started

↓

In Progress

↓

Completed

OR

Cancelled

OR

Expired

---

# Edge Cases

* Pandit goes offline after accepting
* User refreshes browser
* Network disconnect
* Multiple tabs
* Duplicate Join
* Wallet becomes zero
* Pandit rejects after timeout
* User closes browser
* Call drops unexpectedly
* Chat abandoned
* Booking expires
* Stream reconnection
* Simultaneous bookings
* Double billing prevention

---

# Admin Features

* View all consultations
* View earnings
* View wallet logs
* Refund consultation
* Force end consultation
* Block abusive users
* Consultation analytics

---

# Expected Result

The consultation system should provide:

* Real-time Chat using GetStream
* Voice Calling
* Video Calling
* Live Notifications
* Online/Offline Presence
* Scheduled Consultations
* Instant Consultations
* Wallet-based minute billing
* Automatic balance deduction
* Automatic session termination on insufficient balance
* Complete consultation history
* Robust handling of reconnects, missed sessions, and edge cases
* Scalable architecture suitable for production deployment
