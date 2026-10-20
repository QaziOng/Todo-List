export default class Task {
  constructor({
    id,
    user_id,
    title,
    description,
    completed,
    image_url,
    created_at,
    updated_at,
  }) {
    Object.assign(this, {
      id,
      user_id,
      title,
      description,
      completed,
      image_url,
      created_at,
      updated_at,
    });
  }
}
