# Class Attendance API

## A class attendance REST API written in Node.js, Express.js, and Prisma

[Postman Documentation](https://www.postman.com/tiketku-api/class-attendance-api/documentation/vrevd2b/api-documentation?workspaceId=e7da5b26-c4b6-455f-ac45-086f7f8271bc&requestId=)

Class Attendance API is a project built to manage student attendance. The project has the following features:

**Authentication**

* User can register and login with email and password.
* User can register and login with Google account.
* User can logout.
* User can reset their password.

**Class Enrollment**

* User can enroll to a class via class token.
* User can enroll to many classes under an organization via an organization token.
* User can un-enroll classes.

**Class Listing**

* User can retrieve enrolled classes information.
* User can retrieve enrolled classes details such as schedules, building, room number, lecturer, video conference link, etc.

**Online Attendance**

* User can scan a QR code to confirm an attendance to a class.
* User can retrieve live information of attendance status.
* User can submit a sick leave with documents to a class with lecturer approval.

**Presence History**

* User can retrieve attendance history.
* User can retrieve attendance details.

**Notification**

* User can receive live notifications from classes when started, ended, or announcement pushed.
* User can view notification history.

**User profile**

* User can retrieve user profile information
* User can change user profile information (except for name)

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
| `POST` | `/api/login` | Logs in a user by email and password | FALSE |
| `GET` | `/api/login/oauth/google` | Logs in a user by Google | FALSE |
| `POST` | `/api/logout` | Logs out a user | TRUE |
| `POST` | `/api/forgot-password` | Sends an email with a url to reset password | FALSE |
| `POST` | `/api/reset-password` | Resets a password of a user | TRUE |
| `GET` | `/api/classes` | Retrieves all enrolled classes | TRUE |
| `GET` | `/api/classes/:class_id` | Retrieves an enrolled class details | TRUE |
| `POST` | `/api/classes` | Enroll to a class | TRUE |
| `DELETE` | `/api/classes/:class_id` | Un-enroll to a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances` | Retrieves attendance history to for a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances/:attendance_id` | Retrieves an attendance details to for a class | TRUE |
| `POST` | `/api/classes/:class_id/attendances` | Submits an attendance/sick leave to a class | TRUE |
| `GET` | `/api/notifications` | Retrieves all notifications | TRUE |
| `GET` | `/api/users/:user_id` | Retrieves a user details | TRUE |
| `PATCH` | `/api/users/:user_id` | Updates a user details | TRUE |
| `DELETE` | `/api/users/:user_id` | Deletes a user details | TRUE |

---
