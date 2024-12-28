# Class Attendance API

## A class attendance REST API written in Node.js, Express.js, and Prisma

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
| POST | /api/v1/auth/register | Registers a new user account | FALSE |
| POST | /api/v1/auth/resend-otp | Resends OTP to user email's for registration | FALSE |
| POST | /api/v1/auth/verify | Verifies a user account registration with OTP | FALSE |
| POST | /api/v1/auth/login | Logs in a user | FALSE |
| GET | /api/v1/auth/logout | Logs out a user | TRUE |
| POST | /api/v1/auth/forgot-password | Sends an email with a url to reset password | FALSE |
| POST | /api/v1/auth/reset-password | Resets a password of a user | TRUE |
| GET | /api/v1/classes | Retrieves all classes | FALSE |
| GET | /api/v1/classes/:id | Retrieves a class details | FALSE |
| GET | /api/v1/my-classes | Retrieves all enrolled classes | TRUE |
| GET | /api/v1/my-classes/:id | Retrieves a enrolled class details | TRUE |
| POST | /api/v1/my-classes | Enroll to a class | TRUE |
| DELETE | /api/v1/my-classes/:id | Un-enroll to a class | TRUE |
| GET | /api/v1/classes/:id/attendances | Retrieves attendance history to for a class | TRUE |
| GET | /api/v1/classes/:id/attendances/:id | Retrieves an attendance details to for a class | TRUE |
| POST | /api/v1/classes/:id/attendances | Submits an attendance/sick leave to a class | TRUE |
| GET | /api/v1/notifications | Retrieves all notifications | TRUE |

---

For all endpoints, the server failure's responses would be the as such:
> Specification for the JSON responses are referring to [JSend](https://github.com/omniti-labs/jsend).

#### Fail Response (Server Failure)

- Description: Fails due to an error on the server.
- Code: 500
- Response Body:
    ```json
    {
        "status": "error",
        "code": 500,
        "message": "Internal server error"
    }
    ```

#### Fail Response (Database Connection Failure)

- Description: Fails due to an error on communication to the database.
- Code: 500
- Response Body:
    ```json
    {
        "status": "error",
        "code": 500,
        "message": "Unable to communicate with database"
    }
    ```

---

### POST /register

... to be written later