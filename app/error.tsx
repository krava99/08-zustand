"use client";

interface ErrorDisplayProps {
  error: Error;
}

export default function ErrorMessage({ error }: ErrorDisplayProps) {
  return <p>Could not fetch the list of notes. {error.message}</p>;
}
