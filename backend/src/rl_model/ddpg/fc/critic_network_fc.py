import torch as T
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import numpy as np
import os


# Critic / Q-value Network / Q
# evaluate state/action pairs
class CriticNetworkFC(nn.Module):
    def __init__(self, learning_rate, n_actions, fc1_dims, fc2_dims, fc3_dims, name):
        super(CriticNetworkFC, self).__init__()
        self.name = name
        input_size = (n_actions - 1) * 7 + n_actions
        self.relu = nn.ReLU()

        # for state_value
        self.fc1 = nn.Linear(input_size, fc1_dims)
        self.bn1 = nn.LayerNorm(fc1_dims)
        f1 = 1.0 / np.sqrt(self.fc1.weight.data.size()[1])  # Square root of the fan-in
        nn.init.uniform_(self.fc1.weight.data, -f1, f1)
        nn.init.uniform_(self.fc1.bias.data, -f1, f1)

        self.fc2 = nn.Linear(fc1_dims, fc2_dims)
        self.bn2 = nn.LayerNorm(fc2_dims)
        f2 = 1.0 / np.sqrt(self.fc2.weight.data.size()[1])
        nn.init.uniform_(self.fc2.weight.data, -f2, f2)
        nn.init.uniform_(self.fc2.bias.data, -f2, f2)

        self.fc3 = nn.Linear(fc2_dims, fc3_dims)
        self.bn3 = nn.LayerNorm(fc3_dims)
        f3 = 1.0 / np.sqrt(self.fc3.weight.data.size()[1])
        nn.init.uniform_(self.fc3.weight.data, -f3, f3)
        nn.init.uniform_(self.fc3.bias.data, -f3, f3)

        self.action_value = nn.Linear(n_actions, fc3_dims)

        self.bn4 = nn.LayerNorm(fc3_dims + n_actions)

        self.q = nn.Linear(fc3_dims, 1)
        f4 = 0.0003
        T.nn.init.uniform_(self.q.weight.data, -f4, f4)
        T.nn.init.uniform_(self.q.bias.data, -f4, f4)

        self.optimizer = optim.Adam(self.parameters(), lr=learning_rate)

        self.device = T.device("cpu")
        self.to(self.device)

    def forward(self, state, action):
        state_value = self.fc1(state)
        state_value = self.bn1(state_value)
        state_value = F.relu(state_value)
        state_value = self.fc2(state_value)
        state_value = self.bn2(state_value)
        state_value = F.relu(state_value)
        state_value = self.fc3(state_value)
        state_value = self.bn3(state_value)

        action_value = self.action_value(action)
        action_value = F.relu(action_value)

        state_action_value = T.add(state_value, action_value)
        state_action_value = F.relu(state_action_value)
        state_action_value = self.q(state_action_value)

        return state_action_value

    def save_checkpoint(self, path):
        print("... saving checkpoint ...")
        T.save(self.state_dict(), path)

    def load_checkpoint(self, path):
        if os.path.exists(path):
            print("... loading checkpoint ...")
            self.load_state_dict(T.load(path))
