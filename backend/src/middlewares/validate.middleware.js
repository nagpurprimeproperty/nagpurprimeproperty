export default function validate(schema) {
  return (req, _res, next) => {
    try {
      console.log('Validating request...', req.body);
      // ── Helper: format Zod errors ─────────────────────────
      const formatZodErrors = (issues, prefix = "") => {
        return issues.map((e) => ({
          field: prefix
            ? `${prefix}.${e.path.join(".")}`
            : e.path.join("."),
          message: e.message,
          code: e.code, // optional but useful
        }));
      };

      // ── Helper: format Joi errors ─────────────────────────
      const formatJoiErrors = (details, prefix = "") => {
        return details.map((e) => ({
          field: prefix
            ? `${prefix}.${e.path.join(".")}`
            : e.path.join("."),
          message: e.message,
          type: e.type,
        }));
      };

      // ── Pattern 1: Flat schema (req.body directly) ────────
      if (typeof schema?.safeParse === "function") {
        const result = schema.safeParse(req.body);

        if (!result.success) {
          return next({
            statusCode: 400,
            message: "Validation Error",
            errors: formatZodErrors(result.error.issues),
          });
        }

        req.body = result.data;
        return next();
      }

      // ── Pattern 2: Nested schema (body/query/params) ──────
      const parts = ["body", "query", "params"];
      let allErrors = [];

      for (const part of parts) {
        if (!schema[part]) continue;

        const partSchema = schema[part];

        // ── Zod ────────────────────────────────────────────
        if (typeof partSchema.safeParse === "function") {
          const result = partSchema.safeParse(req[part]);

          if (!result.success) {
            allErrors.push(
              ...formatZodErrors(result.error.issues, part)
            );
          } else {
            req[part] = result.data;
          }
        }

        // ── Joi ────────────────────────────────────────────
        else if (typeof partSchema.validate === "function") {
          const { error, value } = partSchema.validate(req[part], {
            abortEarly: false,
            stripUnknown: true,
          });

          if (error) {
            allErrors.push(
              ...formatJoiErrors(error.details, part)
            );
          } else {
            req[part] = value;
          }
        }
      }

      // ── If any errors found ──────────────────────────────
      if (allErrors.length > 0) {
        return next({
          statusCode: 400,
          message: "Validation Error",
          errors: allErrors,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}