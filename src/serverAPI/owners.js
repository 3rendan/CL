class Owner {
  constructor(id, name, long_name) {
    this.name = name;
    this.long_name = long_name;
    this.id = id;
  }

  body() {
    return {name: this.name, long_name: this.long_name}
  }
}

const updateOwner = async (e, owner) => {
    e.preventDefault();
    try {
      const body = owner.body();
      const response = await fetch(
        `http://localhost:5000/owners/${owner.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  };

const insertOwner = async (e, owner) => {
  e.preventDefault();
  try {
    const body = owner.body();
    const response = await fetch("http://localhost:5000/owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const deleteOwner = async id => {
  try {
    const deleteOwner = await fetch(`http://localhost:5000/owners/${id}`, {
      method: "DELETE"
    });

    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
};

const getOwners = async () => {
  try {
    const response = await fetch("http://localhost:5000/owners");
    const jsonData = await response.json();
    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const getOwner = async id => {
  try {
    const response = await fetch(
      `http://localhost:5000/owners/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );
    const jsonData = await response.json();

    return jsonData;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const OwnerColumns = ['Name', 'Long Name'];
export {
  Owner,
  OwnerColumns,
  updateOwner,
  insertOwner,
  deleteOwner,
  getOwners,
  getOwner
}
