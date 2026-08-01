import { useEffect, useState, useCallback } from "react";
import { Box, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { userApi } from "../../api/userApi.js";
import { useDoubleConfirmAction } from "../../utils/hooks/useDoubleConfirmAction.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userApi.list({ limit: 100 });
      setUsers(data.data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Double confirmation for toggle active/inactive ---
  const { trigger: triggerToggle, dialogProps: toggleDialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => userApi.toggleActive(targetId, confirmToken),
    onSuccess: () => fetchData(),
  });

  // --- Double confirmation for delete ---
  const { trigger: triggerDelete, dialogProps: deleteDialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => userApi.remove(targetId, confirmToken),
    onSuccess: () => fetchData(),
  });

  const handleToggle = (id) => { setTargetId(id); setTimeout(() => triggerToggle(), 0); };
  const handleDelete = (id) => { setTargetId(id); setTimeout(() => triggerDelete(), 0); };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "phone", headerName: "Phone", width: 130 },
    {
      field: "isActive", headerName: "Status", width: 100,
      renderCell: (p) => <Chip label={p.value ? "Active" : "Inactive"} color={p.value ? "success" : "default"} size="small" />,
    },
    {
      field: "actions", headerName: "Actions", width: 130, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={params.row.isActive ? "Deactivate Account" : "Activate Account"}>
            <IconButton size="small" onClick={() => handleToggle(params.row.id)}>
              {params.row.isActive ? <BlockIcon fontSize="small" color="warning" /> : <CheckCircleOutlineIcon fontSize="small" color="success" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Account">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Users</Typography>

      <Box sx={{ height: 560, bgcolor: "background.paper" }}>
        <DataGrid rows={users} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Box>

      <ConfirmDialog {...toggleDialogProps} title="Change Account Status" severity="warning" />
      <ConfirmDialog {...deleteDialogProps} title="Delete User" severity="error" confirmText="Yes, Delete Permanently" />
    </Box>
  );
}
