import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } from './reducers/rawMaterialSlice';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

const RawMaterialManager = () => {
  const dispatch = useDispatch();
  const rawMaterials = useSelector((state) => state.rawMaterials.rawMaterials);
  const status = useSelector((state) => state.rawMaterials.status);
  const error = useSelector((state) => state.rawMaterials.error);

  const [newMaterial, setNewMaterial] = useState({ materialName: '' });
  const [updateMaterial, setUpdateMaterial] = useState({ id: '', materialName: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRawMaterials());
    }
  }, [status, dispatch]);

  const handleAddMaterial = () => {
    if (newMaterial.materialName.trim() !== '') {
      dispatch(addRawMaterial(newMaterial));
      setNewMaterial({ materialName: '' }); // Reset input field
    }
  };

  const handleUpdateMaterial = () => {
    if (updateMaterial.id && updateMaterial.materialName.trim() !== '') {
      dispatch(updateRawMaterial(updateMaterial));
      setUpdateMaterial({ id: '', materialName: '' });
    }
  };

  const handleDeleteMaterial = (id) => {
    dispatch(deleteRawMaterial(id));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <h1>Raw Material Manager</h1>

      {status === 'loading' && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <h2>Add Raw Material</h2>
      <input
        type="text"
        placeholder="Material Name"
        value={newMaterial.materialName || ''} // Ensure input is always controlled
        onChange={(e) => setNewMaterial({ ...newMaterial, materialName: e.target.value })}
      />
      <button onClick={handleAddMaterial}>Add Material</button>

      <h2>Update Raw Material</h2>
      <input
        type="text"
        placeholder="ID"
        value={updateMaterial.id || ''} // Ensure input is always controlled
        onChange={(e) => setUpdateMaterial({ ...updateMaterial, id: e.target.value })}
      />
      <input
        type="text"
        placeholder="Material Name"
        value={updateMaterial.materialName || ''} // Ensure input is always controlled
        onChange={(e) => setUpdateMaterial({ ...updateMaterial, materialName: e.target.value })}
      />
      <button onClick={handleUpdateMaterial}>Update Material</button>

      <h2>Raw Materials</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Material Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rawMaterials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.id}</TableCell>
                <TableCell>{material.materialName}</TableCell>
                <TableCell>
                  <button onClick={() => handleDeleteMaterial(material.id)}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rawMaterials.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]} // Correctly limit to these values
      />
    </div>
  );
};

export default RawMaterialManager;
