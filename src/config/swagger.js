import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "CRM Backend API",
      version: "1.0.0",
      description: "API documentation for CRM Backend",
      contact: {
        name: "Rizvan",
        email: "rizvan@finseraa.com",
        url: "https://rizvan.is-a.dev/",
      },
    },

    servers: [
      {
        url: "http://localhost:5353",
        description: "Local server",
      },
      {
        url: "https://your-production-domain.com",
        description: "Production server",
      },
    ],

    components: {
      /**
       * JWT Authentication
       */
      securitySchemes: {
        authToken: {
          type: "apiKey",
          in: "header",
          name: "authorization",
          description: "JWT token (NO Bearer prefix)",
        },
      },

      /**
       * Reusable Schemas
       */
      schemas: {
        /**
         * Booking
         */
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user_id: { type: "string" },
            bdm: { type: "string" },
            branch_name: { type: "string" },
            company_name: { type: "string" },
            contact_person: { type: "string" },
            email: { type: "string" },
            contact_no: { type: "string" },
            services: {
              type: "array",
              items: { type: "string" },
            },
            total_amount: { type: "number" },
            payment_date: { type: "string", format: "date-time" },
            status: { type: "string" },
            bank: { type: "string" },
            state: { type: "string" },
            isDeleted: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        /**
         * Email / Lead
         */
        LeadModel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            companyName: { type: "string" },
            phoneNumber: { type: "string" },
            email: { type: "string" },
            location: { type: "string" },
            service: { type: "string" },
            message: { type: "string" },
            assignedTo: { type: "string", example: "unassigned" },
            isDeleted: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        /**
         * Employee / HR Profile
         */
        EmployeeModel: {
          type: "object",
          properties: {
            userId: { type: "string" },
            employeeId: { type: "string" },
            employeeFullName: { type: "string" },
            designation: { type: "string" },
            department: { type: "string" },
            branch: { type: "string" },
            gender: { type: "string" },
            maritalStatus: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            dateOfJoining: { type: "string", format: "date" },
            reportingManager: { type: "string" },
            personalEmailAddress: { type: "string" },
            workEmail: { type: "string" },
            personalContactNumber: { type: "string" },
            workPhoneNumber: { type: "string" },
            profileCompletionStatus: {
              type: "string",
              example: "approved",
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        /**
         * Payment Link Model
         */
        paymentLinkModel: {
          type: "object",
          required: ["customer", "contact", "amount", "bdm", "link"],
          properties: {
            customer: {
              type: "string",
              example: "Rahul Sharma",
            },
            contact: {
              type: "string",
              example: "9876543210",
            },
            amount: {
              type: "number",
              minimum: 1,
              example: 15000,
            },
            bdm: {
              type: "string",
              example: "BDM001",
              description: "Business Development Manager ID or Name",
            },
            description: {
              type: "string",
              example: "GST filing payment",
            },
            link: {
              type: "string",
              example: "https://rzp.io/i/AbCdEf",
            },
            status: {
              type: "string",
              enum: ["PENDING", "PAID", "EXPIRED", "FAILED"],
              example: "PENDING",
            },
          },
        },

        /**
         * Payment QR Model
         */
        paymentQRModel: {
          type: "object",
          required: ["name", "amount", "qr_id"],
          properties: {
            name: {
              type: "string",
              example: "Rahul Sharma",
            },

            bdm: {
              type: "string",
              example: "BDM001",
              description: "Business Development Manager identifier",
            },

            amount: {
              type: "number",
              example: 25000,
            },

            description: {
              type: "string",
              example: "UPI QR payment for GST filing",
            },

            qr_id: {
              type: "string",
              example: "qr_FGk92kLmPq",
              description: "Unique Razorpay QR ID",
            },

            qr_image: {
              type: "string",
              example: "https://api.razorpay.com/v1/qr_codes/qr_FGk92kLmPq",
            },

            usage: {
              type: "string",
              example: "single_use",
            },

            purpose: {
              type: "string",
              example: "UPI QR Payment",
            },

            fixed_amount: {
              type: "boolean",
              example: true,
            },

            close_by: {
              type: "number",
              example: 1735689600,
              description: "Unix timestamp when QR expires",
            },

            status: {
              type: "string",
              enum: ["Pending", "Paid", "Expired", "Cancelled"],
              example: "Pending",
            },
          },
        },

        /**
         * Service
         */
        ServiceModel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            label: { type: "string" },
            value: { type: "string" },
            status: { type: "string", example: "active" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        /**
         * User (Stored)
         */
        UserModel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            user_role: { type: "string", example: "admin" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        /**
         * Login Request
         */
        // LoginRequest: {
        //   type: "object",
        //   required: ["email", "password"],
        //   properties: {
        //     email: { type: "string", example: "admin@crm.com" },
        //     password: { type: "string", example: "Admin@123" },
        //   },
        // },

        /**
         * Login Response
         */
        // LoginResponse: {
        //   type: "object",
        //   properties: {
        //     success: { type: "boolean", example: true },
        //     token: { type: "string" },
        //     user: {
        //       $ref: "#/components/schemas/User",
        //     },
        //   },
        // },

        /**
         * Invoice
         */
        InvoiceModel: {
          type: "object",
          properties: {
            _id: { type: "string" },
            invoiceNumber: { type: "string" },
            customerName: { type: "string" },
            customerEmail: { type: "string" },
            amount: { type: "number" },
            taxAmount: { type: "number" },
            totalAmount: { type: "number" },
            status: { type: "string" },
            dueDate: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        /**  Welcome Mail**/

        // WelcomeEmailRequest: {
        //   type: "object",
        //   required: ["email", "name"],
        //   properties: {
        //     email: {
        //       type: "string",
        //       example: "client@example.com",
        //     },
        //     name: {
        //       type: "string",
        //       example: "ABC Pvt Ltd",
        //     },
        //     amount: {
        //       type: "number",
        //       example: 50000,
        //       description: "Optional onboarding amount",
        //     },
        //   },
        // },

        /**
         * Common Error
         */
        // ErrorResponse: {
        //   type: "object",
        //   properties: {
        //     message: { type: "string" },
        //   },
        // },
      },
    },

    /**
     * Global JWT requirement
     */
    security: [
      {
        authToken: [],
      },
    ],
  },

  apis: ["./src/api/v1/routes/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
