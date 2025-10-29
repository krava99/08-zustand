import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/api";

import type { NoteTag } from "../../types/note";
import css from "./NoteForm.module.css";

type FormNoteTag = NoteTag | "";

export interface NoteFormValues {
  title: string;
  content: string;
  tag: FormNoteTag;
}

interface NoteFormProps {
  onClose: () => void;
}

export const NoteForm = ({ onClose }: NoteFormProps) => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const initialValues: NoteFormValues = { title: "", content: "", tag: "" };

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, "Title must be at least 3 characters")
      .max(50, "Title must be at most 50 characters")
      .required("Title is required"),
    content: Yup.string().max(500, "Content must be at most 500 characters"),
    tag: Yup.mixed<FormNoteTag>()
      .oneOf(
        ["Todo", "Work", "Personal", "Meeting", "Shopping", ""],
        "Invalid tag"
      )
      .notOneOf([""], "Tag is required")
      .required("Tag is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        createMutation.mutate(
          { ...values, tag: values.tag as NoteTag },
          {
            onSuccess: () => {
              resetForm();
              onClose();
            },
          }
        );
      }}
    >
      {({ isSubmitting }) => {
        const isDisabled = isSubmitting || createMutation.isPending;

        return (
          <Form className={css.form}>
            <div className={css.formGroup}>
              <label htmlFor="title">Title</label>
              <Field id="title" name="title" className={css.input} />
              <ErrorMessage
                name="title"
                component="span"
                className={css.error}
              />
            </div>

            <div className={css.formGroup}>
              <label htmlFor="content">Content</label>
              <Field
                as="textarea"
                id="content"
                name="content"
                rows={8}
                className={css.textarea}
              />
              <ErrorMessage
                name="content"
                component="span"
                className={css.error}
              />
            </div>

            <div className={css.formGroup}>
              <label htmlFor="tag">Tag</label>
              <Field as="select" id="tag" name="tag" className={css.select}>
                <option value="">Select tag</option>
                <option value="Todo">Todo</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Meeting">Meeting</option>
                <option value="Shopping">Shopping</option>
              </Field>
              <ErrorMessage name="tag" component="span" className={css.error} />
            </div>

            <div className={css.actions}>
              <button
                type="button"
                className={css.cancelButton}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={css.submitButton}
                disabled={isDisabled}
              >
                {createMutation.isPending ? "Creating..." : "Create note"}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
