package server

import (
	pbFlow "github.com/cilium/cilium/api/v1/flow"
	"github.com/cilium/hubble-ui/backend/domain/flow"
	"github.com/cilium/hubble-ui/backend/domain/link"
	"github.com/cilium/hubble-ui/backend/domain/service"
	"github.com/cilium/hubble-ui/backend/proto/ui"
)

func getFlagsWhichEventsRequested(events []ui.EventType) *eventFlags {
	flags := new(eventFlags)

	for _, event := range events {
		if event == FLOW_EVENT {
			flags.Flow = true
		}

		if event == FLOWS_EVENT {
			flags.Flows = true
		}

		if event == SERVICE_STATE_EVENT {
			flags.Services = true
		}

		if event == SERVICE_LINK_EVENT {
			flags.ServiceLinks = true
		}

		if event == NS_STATE_EVENT {
			flags.Namespaces = true
		}
	}

	return flags
}

func eventResponseForService(
	svc *service.Service, cflags *cacheFlags,
) *ui.GetEventsResponse {
	sstate := &ui.ServiceState{
		Service: svc.ToProto(),
		Type:    stateChangeFromCacheFlags(cflags),
	}

	f := svc.FlowRef()

	return &ui.GetEventsResponse{
		Node:      f.NodeName,
		Timestamp: f.Time,
		Event:     &ui.GetEventsResponse_ServiceState{sstate},
	}
}

func eventResponseForLink(
	l *link.Link, cflags *cacheFlags,
) *ui.GetEventsResponse {
	f := l.IntoFlow()
	lstate := &ui.ServiceLinkState{
		ServiceLink: l.ToProto(),
		Type:        stateChangeFromCacheFlags(cflags),
	}

	return &ui.GetEventsResponse{
		Node:      f.NodeName,
		Timestamp: f.Time,
		Event:     &ui.GetEventsResponse_ServiceLinkState{lstate},
	}
}

func eventResponseFromFlow(f *flow.Flow) *ui.GetEventsResponse {
	ref := f.Ref()
	return &ui.GetEventsResponse{
		Node:      ref.NodeName,
		Timestamp: ref.Time,
		Event:     &ui.GetEventsResponse_Flow{ref},
	}
}

func eventResponseFromRawFlows(flows []*pbFlow.Flow) *ui.GetEventsResponse {
	n := len(flows)
	if n == 0 {
		return nil
	}

	ref := flows[n-1]
	return &ui.GetEventsResponse{
		Node:      ref.NodeName,
		Timestamp: ref.Time,
		Event: &ui.GetEventsResponse_Flows{
			Flows: &ui.Flows{
				Flows: flows,
			},
		},
	}
}

func stateChangeFromCacheFlags(cflags *cacheFlags) ui.StateChange {
	if cflags.Exists {
		return ui.StateChange_EXISTS
	} else if cflags.Created {
		return ui.StateChange_ADDED
	} else if cflags.Updated {
		return ui.StateChange_MODIFIED
	} else if cflags.Deleted {
		return ui.StateChange_DELETED
	}

	return ui.StateChange_UNKNOWN_STATE_CHANGE
}