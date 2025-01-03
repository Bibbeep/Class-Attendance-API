# Class Attendance API

## A class attendance REST API written in Node.js, Express.js, and Prisma

[Postman Documentation](https://www.postman.com/tiketku-api/class-attendance-api/documentation/vrevd2b/api-documentation?workspaceId=e7da5b26-c4b6-455f-ac45-086f7f8271bc&requestId=)

Class Attendance API is a project built to manage students attendance for on-site and online classes. The project has the following features:

**Authentication**

* User can register and login with email and password.
* User can reset their password.

**Class Registration**

* User can enroll to public classes.
* User can enroll to private classes via a class token.
* User can enroll to many private classes under an organization via an organization token.
* User can un-enroll classes.

**Class Listing**

* User can retrieve public classes information.
* User can retrieve enrolled classes information.
* User can retrieve enrolled classes details such as schedules, building, room number, lecturer, video conference link, etc.
* User can retrieve live information of on-going enrolled classes such as list of students attending, duration passed, etc.

**Online Attendance**

* User can submit a code to confirm an attendance to a class.
* User can scan a QR code to confirm an attendance to a class.
* User can submit a sick leave with documents to a class.

**Presence History**

* User can retrieve attendance history.
* User can retrieve attendance details.

**Notification**

* User can receive live notifications from classes.
* User can view notification history.
* User can mark notification as read.

---

## Entity Relationship Diagram

[Open here](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=class-attendance-erd.drawio#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1KsbHXRWuHZn-n7AqdqGWF9gc66Sm4460%26export%3Ddownload)

---

## Endpoints

| Method | URL | Functionality | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/register` | Registers a new user account | FALSE |
| `POST` | `/api/verify` | Verifies a user account registration with OTP | FALSE |
| `POST` | `/api/resend-otp` | Resends OTP to user email's for registration | FALSE |
| `POST` | `/api/login` | Logs in a user | FALSE |
| `POST` | `/api/logout` | Logs out a user | TRUE |
| `POST` | `/api/forgot-password` | Sends an email with a url to reset password | FALSE |
| `POST` | `/api/reset-password` | Resets a password of a user | TRUE |
| `GET` | `/api/classes` | Retrieves all classes | FALSE |
| `GET` | `/api/classes/:class_id` | Retrieves a class details | FALSE |
| `GET` | `/api/my-classes` | Retrieves all enrolled classes | TRUE |
| `GET` | `/api/my-classes/:my_class_id` | Retrieves a enrolled class details | TRUE |
| `POST` | `/api/my-classes` | Enroll to a class | TRUE |
| `DELETE` | `/api/my-classes/:my_class_id` | Un-enroll to a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances` | Retrieves attendance history to for a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances/:attendance_id` | Retrieves an attendance details to for a class | TRUE |
| `POST` | `/api/classes/:class_id/attendances` | Submits an attendance/sick leave to a class | TRUE |
| `GET` | `/api/notifications` | Retrieves all notifications | TRUE |

---
