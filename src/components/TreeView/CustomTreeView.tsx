import React, { useState, useCallback, useMemo } from 'react';
import {
    TreeView,
    TreeItem,
    TreeItemProps,
} from '@mui/lab';
import {
    Typography,
    Box,
    IconButton,
    Checkbox,
    TextField,
} from '@mui/material';
import {
    ExpandMore,
    ChevronRight,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface TreeNodeType {
    id: string;
    name: string;
    children?: TreeNodeType[];
    [key: string]: any;
}

interface CustomTreeViewProps {
    data: TreeNodeType[];
    onNodeSelect?: (node: TreeNodeType) => void;
    onNodeToggle?: (nodeIds: string[]) => void;
    onNodeEdit?: (node: TreeNodeType) => void;
    onNodeDelete?: (node: TreeNodeType) => void;
    onNodeAdd?: (parentNode: TreeNodeType | null) => void;
    selectable?: boolean;
    editable?: boolean;
    deletable?: boolean;
    addable?: boolean;
    searchable?: boolean;
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} />
))(({ theme }) => ({
    [`& .MuiTreeItem-content`]: {
        borderRadius: theme.spacing(0.5),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '&.Mui-expanded': {
            fontWeight: theme.typography.fontWeightRegular,
        },
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
            color: 'var(--tree-view-color)',
        },
    },
    [`& .MuiTreeItem-group`]: {
        marginLeft: 0,
        [`& .MuiTreeItem-content`]: {
            paddingLeft: theme.spacing(2),
        },
    },
}));

const CustomTreeView: React.FC<CustomTreeViewProps> = ({
    data,
    onNodeSelect,
    onNodeToggle,
    onNodeEdit,
    onNodeDelete,
    onNodeAdd,
    selectable = false,
    editable = false,
    deletable = false,
    addable = false,
    searchable = false,
}) => {
    const [expanded, setExpanded] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
        if (onNodeToggle) {
            onNodeToggle(nodeIds);
        }
    };

    const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setSelected(nodeIds);
        if (onNodeSelect && nodeIds.length > 0) {
            const selectedNode = findNodeById(data, nodeIds[0]);
            if (selectedNode) {
                onNodeSelect(selectedNode);
            }
        }
    };

    const findNodeById = (nodes: TreeNodeType[], id: string): TreeNodeType | null => {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children) {
                const foundNode = findNodeById(node.children, id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    };

    const renderTree = useCallback((nodes: TreeNodeType[]) => (
        nodes.map((node) => (
            <StyledTreeItem
                key={node.id}
                nodeId={node.id}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                            {node.name}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                            {addable && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onNodeAdd) onNodeAdd(node);
                                    }}
                                    size="small"
                                >
                                    <AddIcon fontSize="inherit" />
                                </IconButton>
                            )}
                            {editable && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onNodeEdit) onNodeEdit(node);
                                    }}
                                    size="small"
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                            )}
                            {deletable && (
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onNodeDelete) onNodeDelete(node);
                                    }}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            )}
                            {selectable && (
                                <Checkbox
                                    checked={selected.indexOf(node.id) !== -1}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleSelect(e, [node.id])}
                                />
                            )}
                        </Box>
                    </Box>
                }
            >
                {Array.isArray(node.children) ? renderTree(node.children) : null}
            </StyledTreeItem>
        ))
    ), [selected, addable, editable, deletable, selectable, onNodeAdd, onNodeEdit, onNodeDelete]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const filterNodes = (nodes: TreeNodeType[]): TreeNodeType[] => {
            return nodes.reduce((acc: TreeNodeType[], node) => {
                if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    acc.push(node);
                } else if (node.children) {
                    const filteredChildren = filterNodes(node.children);
                    if (filteredChildren.length > 0) {
                        acc.push({ ...node, children: filteredChildren });
                    }
                }
                return acc;
            }, []);
        };

        return filterNodes(data);
    }, [data, searchTerm]);

    return (
        <Box>
            {searchable && (
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                />
            )}
            <TreeView
                aria-label="custom tree"
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
            >
                {renderTree(filteredData)}
            </TreeView>
        </Box>
    );
};

export default CustomTreeView;
