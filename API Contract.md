# PRESENTLY API


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
| `POST` | `/api/reset-password` | Resets a password of a user | FALSE |
| `GET` | `/api/my-classes` | Retrieves all enrolled classes | TRUE |
| `GET` | `/api/my-classes/:my_class_id` | Retrieves an enrolled class details | TRUE |
| `POST` | `/api/my-classes` | Enroll to a class | TRUE |
| `DELETE` | `/api/my-classes/:my_class_id` | Un-enroll to a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances` | Retrieves attendance history to for a class | TRUE |
| `GET` | `/api/classes/:class_id/attendances/:attendance_id` | Retrieves an attendance details to for a class | TRUE |
| `POST` | `/api/classes/:class_id/attendances` | Submits an attendance/sick leave to a class | TRUE |
| `GET` | `/api/notifications` | Retrieves all notifications | TRUE |
| `GET` | `/api/users/:user_id` | Retrieves a user details | TRUE |
| `PATCH` | `/api/users/:user_id` | Updates a user details | TRUE |
| `DELETE` | `/api/users/:user_id` | Deletes a user details | TRUE |

---

## POST /api/register

<details>
<summary>Request example</summary>

`POST /api/register`
```json
{
	"email": "test1@mail.com",
    "password": "password",
	"first_name": "Test",
    "last_name": "User",
    "birth_date": "2000-01-01"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 201,
    "data": {
        "user": {
            "id": 101,
            "email": "test1@mail.com",
            "first_name": "Test",
            "last_name": "User",
            "role": "STUDENT"
        }
    },
    "message": "Successfully registered a new account. OTP code has been sent to your email address",
    "errors": null
}
```

</details>

## POST /api/verify

<details>
<summary>Request example</summary>

`POST /api/verify`
```json
{
	"email": "test1@mail.com",
	"otp": "368521"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "id": 101,
            "email": "test1@mail.com",
            "first_name": "Test",
            "last_name": "User",
            "role": "STUDENT"
        }
    },
    "message": "Successfully verified a new account",
    "errors": null
}
```

</details>

## POST /api/resend-otp

<details>
<summary>Request example</summary>

`POST /api/resend-otp`
```json
{
    "email": "test1@mail.com"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": null,
    "message": "Successfully resend OTP code to your email address",
    "errors": null
}
```

</details>

## POST /api/login

<details>
<summary>Request example</summary>

`POST /api/login`
```json
{
    "email": "student1@presently.com",
    "password": "password"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "id": 98,
            "email": "student1@presently.com",
            "first_name": "Student",
            "last_name": "1",
            "role": "STUDENT"
        },
        "access_token": "{{vault:json-web-token}}"
    },
    "message": "Successfully logged in",
    "errors": null
}
```

</details>

## GET /api/login/oauth/google

<details>
<summary>Request example</summary>

`GET /api/login/oauth/google`

</details>

<details>
<summary>Success response example</summary>

```json
{
	"status": "success",
	"status_code": 200,
	"data": {
		"user": {
			"id": 169,
            "email": "dummy@gmail.com",
            "first_name": "Dummy",
            "last_name": "User",
            "role": "STUDENT"
		},
		"access_token": "{{vault:json-web-token}}"
	},
	"message": "Successfully logged in with Google",
	"errors": null
}
```

</details>

## POST /api/logout

<details>
<summary>Request example</summary>

`POST /api/logout`

Headers: Authorization (Bearer token)

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": null,
    "message": "Successfully logged out",
    "errors": null
}
```

</details>

## POST /api/forgot-password

<details>
<summary>Request example</summary>

`POST /api/forgot-password`
```json
{
	"email": "test1@mail.com"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "email": "test1@mail.com"
        }
    },
    "message": "Successfully sent password reset link to your email",
    "errors": null
}
```

</details>

## POST /api/reset-password

<details>
<summary>Request example</summary>

`POST /api/reset-password`
```json
{
    "token": "704c1ece2588f9a407053d488b2d2df58a8c1843c16c38fd5206a30917a93e6a",
    "newPassword": "newpassword"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "email": "test1@mail.com"
        }
    },
    "message": "Successfully reset your password",
    "errors": null
}
```

</details>


## GET /api/my-classes

<details>
<summary>Request example</summary>

`GET /api/my-classes?user_id=100&page=2&count=10`

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "my-classes": [
            {
                "id": 1,
                "is_active": true,
                "code": "INF-33201",
                "title": "Pemrograman Web",
                "subtitle": "Tahun Ajaran 2023/2024 - Genap",
                "section": "A",
                "period": "2023/2024 Ganjil",
                "organization": "Universitas Dummy",
                "class_points": 4,
                "point_type": "SKS",
                "lecturers": ["Junaidi Papeda S.T., M. Eng.", "Kukuma Kakami B.Cs., M.Cs."],
                "banner_image_url": "https://dummy.com/dummyimage.png",
                "schedules": [
                    {
                        "day": "Selasa",
                        "start_time": "14:45",
                        "end_time": "17:15"
                    },
                    {
                        "day": "Kamis",
                        "start_time": "14:45",
                        "end_time": "17:15"
                    }
                ],
                "attendances": {
                    "presence": 5,
                    "sick_leave": 0,
                    "leave": 1,
                    "absence": 1,
                    "to_attend": 16,
                    "percentage": 43.75
                }
            },
            ...
        ],
        "meta": {
            "pagination": {
                "current_page": 2,
                "links": {
                    "next": "/api/my-classes?user_id=100&page=3&count=10",
                    "previous": "/api/my-classes?user_id=100&page=1&count=10"
                },
                "per_page": 10,
                "total": 31,
                "total_pages": 4
            }
        }
    },
    "message": "Successfully retrieved enrolled classes data",
    "errors": null
}
```

</details>

## GET /api/my-classes/:my_class_id

<details>
<summary>Request example</summary>

`GET /api/myclasses/1`

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "my_class": {
            "id": 1,
            "is_active": true,
            "code": "INF-33201",
            "title": "Pemrograman Web",
            "subtitle": "Tahun Ajaran 2023/2024 - Genap",
            "section": "A",
            "organization": "Universitas Dummy",
            "period": "2023/2024 Ganjil",
            "description": "Mata kuliah sebagian besar akan berupa pelaksanaan latihan dan tugas intensif guna meningkatkan kemampuan mahasiswa dalam merancang dan membangun aplikasi sistem informasi berbasis teknologi web, sehingga dapat “berjalan” di atas platform browser web yang dapat digunakan untuk melakukan transformasi data menjadi Informasi. Latihan-latihan secara khusus ditujukan untuk menerapkan prinsip pemrograman berbasis object dalam membuat aplikasi halaman web di Internet, pembuatan document berbentuk pdf menggunakan web. Kemampuan membuat program untuk menyajikan informasi kepada pengguna dan membuat aplikasi sistem informasi berbasis pada teknologi web.",
            "class_points": 4,
            "point_type": "SKS",
            "lecturers": ["Junaidi Papeda S.T., M. Eng.", "Kukuma Kakami B.Cs., M.Cs."],
            "schedules": [
                {
                    "day": "Selasa",
                    "start_time": "14:45",
                    "end_time": "17:15"
                },
                {
                    "day": "Kamis",
                    "start_time": "14:45",
                    "end_time": "17:15"
                }
            ],
            "attendances": {
                "presence": 5,
                "sick_leave": 0,
                "leave": 1,
                "absence": 1,
                "to_attend": 16,
                "percentage": 43.75
            },
            "students": [
                "Koko Mulia",
                "Arif Bijaksana",
                "Pipi Popoi",
                ...
            ],
            "banner_image_url": "https://dummy.com/dummyimage.png"
        }
    }
}
```

</details>

## POST /api/my_classes

<details>
<summary>Request example</summary>

`POST /api/my_classes`
```json
{
    "token_type": "single",
    "token": "AHL78A1ASJ"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 201,
    "data": {
        "my_classes": [
            {
                "id": 1,
                "title": "Pemrograman Web",
                "organization": "Universitas Dummy"
            },
            ...
        ]
    },
    "message": "Successfully enrolled",
    "errors": null
}
```

</details>

## DELETE /api/my_classes/:my_class_id

<details>
<summary>Request example</summary>

`DELETE /api/my_classes/1`

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": null,
    "message": "Successfully un-enrolled to class",
    "errors": null
}
```

</details>

## GET /api/users/:user_id

<details>
<summary>Request example</summary>

`GET /api/users/1`

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "id": 1,
            "email": "student1@mail.com",
            "phone_number": "0000000000",
            "first_name": "Student",
            "last_name": "1",
            "birth_date": "2000-01-01",
            "created_at": "2024-12-31T15:00:03Z",
            "updated_at": "2025-01-02T07:13:21Z",
            "is_verified": true,
            "role": "STUDENT"
        }
    },
    "message": "Successfully retrieved user data",
    "errors": null
}
```

</details>

## PATCH /api/users/:user_id

<details>
<summary>Request example</summary>

`PATCH /api/users/1`
```json
{
    "phone_number": "0800080000"
}
```

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": {
        "user": {
            "id": 1,
            "email": "student1@mail.com",
            "phone_number": "0800080000",
            "first_name": "Student",
            "last_name": "1",
            "birth_date": "2000-01-01",
            "created_at": "2024-12-31T15:00:03Z",
            "updated_at": "2025-01-12T08:39:00Z",
            "is_verified": true,
            "role": "STUDENT"
        }
    },
    "message": "Successfully updated user data",
    "errors": null
}
```

</details>

## DELETE /api/users/:user_id

<details>
<summary>Request example</summary>

`DELETE /api/users/1`

</details>

<details>
<summary>Success response example</summary>

```json
{
    "status": "success",
    "status_code": 200,
    "data": null,
    "message": "Successfully deleted user data",
    "errors": null
}
```

</details>