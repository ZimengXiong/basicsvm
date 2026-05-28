# Networking Troubleshooting

The VM can be used from its desktop without host networking. Host access requires the VM app to forward ports.

## Expected forwards

| Host port | Guest port | Use |
| --- | --- | --- |
| `2222` | `22` | SSH |
| `5901` | `5901` | VNC |
| `6080` | `6080` | Browser desktop through noVNC |

## SSH check

From the host:

```bash
ssh -p 2222 beaver@localhost
```

Use password `works`.

## noVNC check

After forwarding guest port `6080`, open:

```text
http://localhost:6080/
```

If the page does not load, confirm that the VM is booted, the forwarding rule points to guest port `6080`, and no other host service is already using port `6080`.

