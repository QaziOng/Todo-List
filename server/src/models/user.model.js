export default class User {
  constructor({ id, email, password_hash, created_at }) {
    Object.assign(this, {
      id,
      email,
      password_hash,
      created_at,
    });
  }
}
