<template>
  <div class="management-card">
    <h2>Adapter Management</h2>

    <div class="section">
      <h3>Create Adapter</h3>
      <label class="label" for="adapterName">Adapter Name</label>
      <input
        type="text"
        id="adapterName"
        v-model="adapterName"
        placeholder="Adapter Name"
        class="input-field"
      />
      <label class="label" for="adapterType">Type</label>
      <select id="adapterType" v-model="adapterType" class="input-field">
        <option value="lora">Lora</option>
        <option value="loraplus">LoraPlus</option>
        <option value="vera">Vera</option>
        <option value="dora">Dora</option>
      </select>
      <label class="label" for="optimizer">Optimizer</label>
      <select id="optimizer" v-model="optimizer" class="input-field">
        <option value="adamw">AdamW</option>
        <option value="sgd">SGD</option>
      </select>
      <label class="label" for="learningRate">Learning Rate</label>
      <input
        type="number"
        id="learningRate"
        v-model="learningRate"
        placeholder="0.0003"
        class="input-field"
      />
      <label class="label" for="scheduler">Scheduler</label>
      <select id="scheduler" v-model="scheduler" class="input-field">
        <option value="no">No Scheduler</option>
        <option value="cosine">Cosine</option>
      </select>
      <label class="label" for="rank">Rank</label>
      <input
        type="number"
        id="rank"
        v-model="rank"
        placeholder="32"
        class="input-field"
      />
      <label class="label" for="alpha">Alpha</label>
      <input
        type="number"
        id="alpha"
        v-model="alpha"
        placeholder="64"
        class="input-field"
      />
      <label class="label" for="dropout">Dropout</label>
      <input
        type="number"
        id="dropout"
        v-model="dropout"
        placeholder="0.05"
        class="input-field"
      />
      <label class="label" for="targetModules">Target Modules</label>
      <select
        id="targetModules"
        v-model="targetModules"
        multiple
        class="input-field"
      >
        <option value="q_proj">q_proj</option>
        <option value="k_proj">k_proj</option>
        <option value="v_proj">v_proj</option>
        <option value="o_proj">o_proj</option>
        <option value="gate_proj">gate_proj</option>
        <option value="down_proj">down_proj</option>
        <option value="up_proj">up_proj</option>
      </select>
      <button @click="createAdapter" class="action-button">Create Adapter</button>
    </div>

    <div class="section">
      <h3>View Adapters</h3>
      <button @click="fetchAdapters" class="action-button">List Adapters</button>
      <ul v-if="adapters.length">
        <li v-for="(adapter, index) in adapters" :key="index">
          <p><strong>Name:</strong> {{ adapter.name }}</p>
          <p><strong>Type:</strong> {{ adapter.type }}</p>
          <p><strong>Dir:</strong> {{ adapter.dir }}</p>
          <p><strong>State:</strong> {{ adapter.state }}</p>
          <p><strong>Task:</strong> {{ adapter.task }}</p>
        </li>
      </ul>
      <p v-else>No adapters available.</p>
    </div>

    <div class="section">
      <h3>Delete Adapter</h3>
      <label class="label" for="adapterToDelete">Adapter Name to Delete</label>
      <input
        type="text"
        id="adapterToDelete"
        v-model="adapterToDelete"
        placeholder="Adapter Name to Delete"
        class="input-field"
      />
      <button @click="deleteAdapter" class="action-button">Delete Adapter</button>
    </div>
  </div>
</template>

<script>
import apiClient from "@/axios.js";

export default {
  data() {
    return {
      adapterName: "",
      adapterType: "lora",
      optimizer: "adamw",
      learningRate: 0.0003,
      scheduler: "no",
      rank: 32,
      alpha: 64,
      dropout: 0.05,
      targetModules: [],
      adapterToDelete: "",
      adapters: [],
    };
  },
  methods: {
    async createAdapter() {
      const payload = {
        name: this.adapterName,
        type: this.adapterType,
        optimizer: this.optimizer,
        lr: this.learningRate,
        "Need learning rate schedule": this.scheduler === "cosine" ? "yes" : "no",
        r: this.rank,
        alpha: this.alpha,
        dropout: this.dropout,
        target_modules: this.targetModules.reduce((acc, module) => {
          acc[module] = true;
          return acc;
        }, {}),
      };

      if (this.adapterType === "loraplus") {
        payload.lr_ratio = 8.0;
      } else if (this.adapterType === "vera") {
        payload.d_initial = 0.1;
      }

      if (this.optimizer === "sgd") {
        payload.momentum = 0.0;
      }

      if (this.scheduler === "cosine") {
        payload.lrscheduler = "cosine";
        payload.t_max = 100000;
        payload.eta_min = 0.0;
      }

      try {
        const response = await apiClient.post("/adapter", payload);
        if (response.status === 200 && response.data.success) {
          alert(response.data.message || "Adapter created successfully!");
          await this.fetchAdapters();
        } else {
          console.error("Backend did not confirm adapter creation:", response.data);
          alert("Failed to create adapter. Check backend logs.");
        }
      } catch (error) {
        console.error("Error creating adapter:", error);
        alert("Failed to create adapter.");
      }
    },
    async fetchAdapters() {
      try {
        const response = await apiClient.get("/adapter");
        this.adapters = response.data.map((adapter) => ({
          name: adapter.name,
          type: adapter.type,
          dir: adapter.dir || "N/A",
          state: adapter.state || "N/A",
          task: adapter.task || "N/A",
        }));
      } catch (error) {
        console.error("Error fetching adapters:", error);
        alert("Failed to fetch adapters.");
      }
    },
    async deleteAdapter() {
      if (!this.adapterToDelete) {
        alert("Please provide the name of the adapter to delete.");
        return;
      }

      try {
        const response = await apiClient.delete("/adapter", {
          data: { name: this.adapterToDelete },
        });
        alert(response.data.message || "Adapter deleted successfully!");
        this.fetchAdapters();
      } catch (error) {
        console.error("Error deleting adapter:", error);
        alert("Failed to delete adapter.");
      }
    },
  },
};
</script>

<style scoped>
.management-card {
  background: #1e1e3f;
  border-radius: 10px;
  padding: 1.5rem;
  color: #fff;
  width: 100%;
  max-width: 900px;
  margin: 1rem;
  box-shadow: 0 0 20px rgba(108, 99, 255, 0.2);
}

.section {
  margin-bottom: 1.5rem;
}

.label {
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 0.5rem;
  display: block;
}

.input-field {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  background: #2a2a54;
  color: #fff;
}

.action-button {
  background: #6c63ff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s ease;
}

.action-button:hover {
  background: #5147d7;
}
</style>
