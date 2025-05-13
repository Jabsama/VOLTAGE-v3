import { NextResponse } from 'next/server';

function formatUptime(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hrs  = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return `${days} days ${hrs} hrs ${mins} mins`;
}

export async function GET() {
  try {
    const res = await fetch('https://celiumcompute.ai/api/executors', {
      headers: { Authorization: `Bearer ${process.env.CELIUM_API_KEY}` },
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = await res.json();
    if (!Array.isArray(data)) return NextResponse.json([], { status: 200 });

    const pods = data.map((pod: any) => {
      // 1) GPU display & types
      const count = pod.specs?.gpu?.count ?? 0;
      const machineName = pod.machine_name || 'Unknown GPU';
      const details = Array.isArray(pod.specs?.gpu?.details)
        ? pod.specs.gpu.details
        : [];
      const gpuTypesSet = new Set<string>();
      gpuTypesSet.add(machineName);
      details.forEach((d: any) => {
        if (d.model) gpuTypesSet.add(d.model);
      });
      const gpu_types = Array.from(gpuTypesSet);

      // 2) CPU display
      const cpu = pod.specs?.cpu;
      const cpu_display = cpu
        ? `${cpu.count ?? '?'}x ${cpu.model ?? 'Unknown CPU'}`
        : 'Unknown CPU';

      // 3) RAM & disque en GB
      const memory = pod.specs?.ram?.total
        ? Math.floor(pod.specs.ram.total / 1024 ** 3)
        : null;
      const disk = pod.specs?.hard_disk?.total
        ? Math.floor(pod.specs.hard_disk.total / 1024 ** 3)
        : null;

      // 4) réseau arrondi à 2 décimales
      const network_up = pod.specs?.network?.upload_speed != null
        ? Math.round(pod.specs.network.upload_speed * 100) / 100
        : null;
      const network_down = pod.specs?.network?.download_speed != null
        ? Math.round(pod.specs.network.download_speed * 100) / 100
        : null;

      // 5) location
      const location = {
        city: pod.location?.city ?? '',
        country: pod.location?.country ?? '',
      };

      // 6) ports
      const ports = Array.isArray(pod.specs?.available_port_maps)
        ? pod.specs.available_port_maps.length
        : null;

      // 7) uptime
      const uptime_minutes = pod.uptime_in_minutes ?? 0;
      const uptime_display = uptime_minutes
        ? formatUptime(uptime_minutes)
        : 'Unknown';

      // 8) prix majoré de 25 %
      const raw = pod.price_per_hour ?? pod.price ?? 0;
      const price = Math.round(raw * 1.25 * 100) / 100;

      // 9) Docker-in-Docker → présence de specs.docker.containers
      const isDockerInDocker = Array.isArray(pod.specs?.docker?.containers)
        && pod.specs.docker.containers.length > 0;

      return {
        id: pod.id,
        price,
        gpu_display: `${count}x ${machineName}`,
        cpu_display,
        memory,
        disk,
        network_up,
        network_down,
        location,
        ports,
        uptime_display,
        gpu_types,
        isDockerInDocker,
      };
    });

    return NextResponse.json(pods);
  } catch (err: any) {
    console.error('API exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
